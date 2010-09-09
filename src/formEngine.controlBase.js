;(function (formEngine, undefined) {

    formEngine.controlBase = function controlBase(properties, element, engine) {

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

        function setValue(value) {
            
        };

        that.element = element;
        that.getMarkup = getMarkup;
        that.getChildMarkup = getChildMarkup;
        that.initialize = initialize;
        that.setValue = setValue;

        return that;
    };

})(formEngine);

