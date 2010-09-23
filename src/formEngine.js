//TODO: add file header

;(function (window, document, undefined) {

    var formEngine;

    window.formEngine = formEngine = function formEngine(opts) {

        var that = {},
            model,
            form,
            bindings = [], // {binding, target, method, argument}
            containerNode;

        that.KPI = {
            elementInitialization: undefined,
            markupGeneration: undefined,
            markupInsertion: undefined,
            controlInitialization: undefined,
            bindData: undefined
        };

        function trace (kpi, fn) {
            that.KPI[kpi] = formEngine.measureExecutionTime(fn);
        }

        function init() {

            trace('modelExtension', function () {
                that.model = model = extendModel(opts.model);
            });

            var markup;

            trace('elementInitialization', function () {

                that.bindings = bindings;
                form = formEngine.element(that, opts.form);
                that.bindings = undefined; // bindings can be added only during element tree initialization
            });

            trace('markupGeneration', function () {
                markup = form.control.getMarkup();            
            });

            trace('markupInsertion', function () {
                containerNode = document.getElementById(opts.containerId);
    
                //TODO: investigate other ways to add markup to the page
                containerNode.innerHTML = markup;
            });

            trace('controlInitialization', function () {
                form.control.initialize();
            });

            trace('bindData', function () {
                pushData();
            });
        }

        function pushData(filter, source) {

            var binding, arg;

            for (var i = 0; i < bindings.length; i += 1) {

                binding = bindings[i];

                if (filter && binding.binding.indexOf(filter) !== 0) { // 'startWith' filter
                    continue;
                }

                if (source && binding.target === source) { // need method check?
                    continue;
                }

                arg = (typeof binding.argument === 'function')
                          ? binding.argument(model)
                          : formEngine.getByPath(model, binding.argument || binding.binding);

                binding.target[binding.method](arg);
            }
        }

        function extendModel(model) {

            function extend(obj, path) {

                for (var name in obj) {
                    if (obj.hasOwnProperty(name) && typeof obj[name] === 'object') {
                        extend(obj[name], path ? path + '.' + name : name );
                    }
                }

                obj.setValue = function setValue(property, value) {
                    obj[property] = value;
                    pushData(path ? path + '.' + property : property);
                };
            }

            extend(model);

            return model;
        }

        function show() {
            trace('show', function() {
                      //TODO: remove display:none from containerNode
            });
        };

        // Utils

        function eachElement(fn, element) {

            var current = element || form;

            fn(current); // a parent goes before its children

            for (var i = 1; i < current.elements.length; i += 1) {
                eachElement(fn, current.elements[i]);
            }
        }

        function getElementById(id) {

            var result;

            eachElement(function (element) {
                if (element.id === id) {
                    result = element;
                };
            });

            return result;
        }

        init();

        that.show = show;
        that.pushData = pushData;

        that.eachElement = eachElement;
        that.getElementById = getElementById;

        return that;
    };



    /*
     *  Element
     */

    formEngine.element = function element(engine, metadata) {

        var that = {},
            childrenMetadata = metadata.elements || [];

        that.id = metadata.id;
        that.elements = [];

        for ( var i = 0; i < childrenMetadata.length; i += 1 ) {
            that.elements.push(formEngine.element(engine, childrenMetadata[i]));
        }

        var controlConstructor = formEngine.controls[metadata.controlName] || formEngine.controlBase,
            controlProperties = metadata.controlProperties || {};

        that.control = controlConstructor(controlProperties, that, engine);

        var binding;
        for (var j = 0; j < metadata.bindings.length; j += 1) {
            binding = metadata.bindings[j];
            binding.target = that.control;
            engine.bindings.push(binding);
        }

        var valueBinding = metadata.valueExp;
        valueBinding && that.control.onValueChanged.bind(function (newValue) {
            formEngine.setByPath(engine.model, valueBinding, newValue);
            engine.pushData(valueBinding, that.control);
        });

        return that;
    };

    formEngine.controls = {};
    formEngine.validators = {};

})(window, document);