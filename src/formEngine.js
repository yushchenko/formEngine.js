//TODO: add file header

;(function (window, document, undefined) {

    var formEngine;

    window.formEngine = formEngine = function formEngine(opts) {

        var that = {},
            model,
            form,
            bindings = [], // {binding, target, property}
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

                var value;

                for (var i = 0; i < bindings.length; i += 1) {
    
                    value = formEngine.getByPath(model, bindings[i].binding);
                    bindings[i].target.control.setValue(value);
                }
            });
        }

        function extendModel(model) {

            //TODO: add setProperty methods

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

        if (metadata.valueExp) { //TODO: add readonlyExp, hiddenExp
            //TODO: add parser for complex expressions
            engine.bindings.push({ binding: metadata.valueExp, target: that, property: 'value' });
        }

        for ( var i = 0; i < childrenMetadata.length; i += 1 ) {
            that.elements.push(formEngine.element(engine, childrenMetadata[i]));
        }

        var controlConstructor = formEngine.controls[metadata.controlName] || formEngine.controlBase,
            controlProperties = metadata.controlProperties || {};

        that.control = controlConstructor(controlProperties, that, engine);

        that.control.onValueChanged.bind(function (newValue) {
            if (metadata.valueExp) {
                formEngine.setByPath(engine.model, metadata.valueExp, newValue);
            }
        });

        return that;
    };

    formEngine.controls = {};
    formEngine.validators = {};

})(window, document);