;(function(formEngine, undefined){

    var t = formEngine.template,
        formTemplate = t('<div class="fe-form"><%=content%></div>');

    formEngine.controls.form = function form(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments);

        that.getMarkup = function getMarkup() {
            return formTemplate({content: that.getChildMarkup()});
        };

        that.initialize = function initialize() {
            that.forEachChildControl(function (child) {
                child.initialize();
            });
        };

        return that;
    };


    var textBoxTemplate = t(
        '<div class="fe-control">' +
            '<label for="<%=id%>"><%=label%></label>' +
            '<input type="text" id="<%=id%>" />' +
        '</div>'
    );

    formEngine.controls.textBox = function textBox(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments),
            $textBox;

        that.getMarkup = function getMarkup() {
            return textBoxTemplate({id: element.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $textBox = $('#' + element.id);

            $textBox.change(function() {
                that.onValueChanged.trigger($textBox.val());
            });
        };

        that.setValue = function setValue(value) {
            $textBox.val(value);
        };

        return that;
    };

})(formEngine);