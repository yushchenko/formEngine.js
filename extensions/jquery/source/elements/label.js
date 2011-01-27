
fe.jquery.elements.label = function label(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label class="fe-element-label"><%=properties.label%></label>' +
            '<span id="<%=editorId%>" class="fe-editor-wide"></span>' +
        '</div>'
    );

    that.setValue = function setValue(value) {
        that.getEditor().text(value);
    };

    return that;
};

fe.jquery.dsl.label = fe.dsl.token('label');