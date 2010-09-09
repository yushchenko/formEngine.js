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


    formEngine.event = function event() {

        var that = {};

        function bind(handler) {
            
        }

        function trigger() {
            
        }

        that.bind = bind;
        that.trigger = trigger;

        return that;
    };
      

    formEngine.element = function element(engine, metadata) {

        var that = {},
            childrenMetadata = metadata.elements || [],
            controlConstructor = formEngine.controls[metadata.controlName] || formEngine.controlBase;

        that.elements = [];

        for ( var i = 0; i < childrenMetadata.length; i += 1 ) {
            that.elements.push(formEngine.element(engine, childrenMetadata[i]));
        }

        that.control = controlConstructor(engine, that);

        return that;
    };


    formEngine.controlBase = function controlBase(engine, element) {

        var that = {};

        function getMarkup() {
            return getChildMarkup();
        };

        function getChildMarkup() {

            var childMarkup = '';

            for (var i = 0; i < element.elements.length; i += 1) {
                childMarkup += element.elements[i].control.getMarkup();
            }

            return childMarkup;
        };

        function initialize() {
            
        };

        that.getMarkup = getMarkup;
        that.getChildMarkup = getChildMarkup;
        that.initialize = initialize;

        return that;
    };

    formEngine.controls = {};
    formEngine.validators = {};

})(window, document);
