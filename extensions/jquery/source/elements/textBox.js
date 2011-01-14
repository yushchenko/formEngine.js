
fe.jquery.elements.textBox = function textBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<input type="text" id="<%=editorId%>"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.initialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().val());
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().val(value);
    };

    return that;
};