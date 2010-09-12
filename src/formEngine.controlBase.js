;(function (formEngine, undefined) {

    formEngine.controlBase = function controlBase(properties, element, engine) {

        var that = {};

        function getMarkup() {
            return getChildMarkup();
        };

        function getChildMarkup() {

            var childMarkup = '';

            forEachChildControl(function (child) {
                childMarkup += child.getMarkup();
            });

            return childMarkup;
        };

        function initialize() {
            
        };

        function setValue(value) {
            
        };

        function forEachChildControl(fn) {

            for (var i = 0; i < element.elements.length; i += 1) {
                fn(element.elements[i].control);
            }
        };

        that.element = element;
        that.getMarkup = getMarkup;
        that.getChildMarkup = getChildMarkup;
        that.initialize = initialize;

        that.setValue = setValue;
        that.onValueChanged = formEngine.event();

        that.forEachChildControl = forEachChildControl;
        
        return that;
    };

})(formEngine);