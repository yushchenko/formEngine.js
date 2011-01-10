
fe.jquery.elements.checkBox = function checkBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<input type="checkbox" id="<%=editorId%>"></input>' +
        '</div>'
    );

    that.initialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().attr('checked'));
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().attr('checked', value);
    };

    return that;
};