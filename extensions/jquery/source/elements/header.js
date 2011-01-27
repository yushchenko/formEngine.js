
fe.jquery.elements.header = function header(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element fe-header">' +
            '<span id="<%=editorId%>"></span>' +
        '</div>'
    );

    that.setValue = function setValue(value) {
        that.getEditor().text(value);
    };

    return that;
};

fe.jquery.dsl.header = fe.dsl.token('header');