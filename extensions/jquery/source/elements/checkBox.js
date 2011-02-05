
fe.jquery.elements.checkBox = function checkBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="checkbox" id="<%=editorId%>"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().attr('checked'));
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().attr('checked', value);
    };

    return that;
};

fe.jquery.dsl.checkBox = fe.dsl.elementConstructor('checkBox');