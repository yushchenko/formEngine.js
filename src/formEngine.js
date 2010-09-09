//TODO: add file header

;(function (window, document, undefined) {

    var formEngine;

    window.formEngine = formEngine = function formEngine(opts) {

        var that = {},
            form,
            model,
            containerNode;

        function init() {

            form = formEngine.element(that, opts.form);

            var markup = form.control.getMarkup();

            containerNode = document.getElementById(opts.containerId);
            //TODO: investigate other ways to add markup to the page
            containerNode.innerHTML = markup;

            form.control.initialize();
        }

        function bindData(data) {
            model = data;
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

        for ( var i = 0; i < childrenMetadata.length; i += 1 ) {
            that.elements.push(formEngine.element(engine, childrenMetadata[i]));
        }

        var controlConstructor = formEngine.controls[metadata.controlName] || formEngine.controlBase,
            controlProperties = metadata.controlProperties || {};

        that.control = controlConstructor(controlProperties, that, engine);

        return that;
    };

    formEngine.controls = {};
    formEngine.validators = {};

})(window, document);
