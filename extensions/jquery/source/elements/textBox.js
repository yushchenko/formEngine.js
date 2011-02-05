
fe.jquery.elements.textBox = function textBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="text" id="<%=editorId%>" class="fe-editor-wide"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().val());
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().val(value);
    };

    return that;
};

fe.jquery.dsl.textBox = fe.dsl.elementConstructor('textBox');