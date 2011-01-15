
fe.jquery.elements.label = function label(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label class="fe-element-label"><%=properties.label%></label>' +
            '<span id="<%=editorId%>"></span>' +
        '</div>'
    );

    that.setValue = function setValue(value) {
        that.getEditor().text(value);
    };

    return that;
};