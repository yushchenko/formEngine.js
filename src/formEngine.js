//TODO: add file header

;(function (window, undefined) {

    var formEngine;

    window.formEngine = formEngine = function formEngine(opts) {

        var that = {};

        that.bindData = function bindData(data) {
            that.data = data;
        };

        function init() {
            that.form = formEngine.element(that, opts.form);
            var markup = that.form.control.getMarkup();
            // add markup to page
            that.form.control.initialize();
        }

        init();

        return that;
    };

    formEngine.element = function element(engine, metadata) {

        var that = {};

        that.control = formEngine.controlBase(engine, that);

        return that;
    };

    formEngine.controlBase = function controlBase(engine, element) {

        var that = {};

        that.getMarkup = function getMarkup() {
        };

        that.initialize = function initialize() {
            
        };

        return that;
    };

    formEngine.controls = {};
    formEngine.validators = {};

})(window);