//TODO: add file header

;(function (window, document, undefined) {

    var formEngine;

    window.formEngine = formEngine = function formEngine(opts) {

        var that = {},
            model,
            form,
            bindings = [], // {binding, target, property}
            containerNode;

        function init() {

            that.bindings = bindings;
            form = formEngine.element(that, opts.form);
            that.bindings = undefined; // Bindings can be added only during element tree initialization

            var markup = form.control.getMarkup();

            containerNode = document.getElementById(opts.containerId);

            //TODO: investigate other ways to add markup to the page
            containerNode.innerHTML = markup;

            form.control.initialize();
        }

        function bindData(data) {

            that.model = model = data;

            var value;
            for (var i = 0; i < bindings.length; i += 1) {

                value = formEngine.getByPath(model, bindings[i].binding);
                bindings[i].target.control.setValue(value);
            }
        };

        function show() {
            //TODO: remove display:none from containerNode
        };

        init();

        that.bindData = bindData;
        that.show = show;

        return that;
    };

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