
fe.jquery.elements.numberEditor = function numberEditor(config) {

    var that = fe.jquery.element(config),
        currentValue;

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="text" id="<%=editorId%>" class="fe-editor-narrow"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {

        var e = that.getEditor();

        e.change(function() {

            var newValue = +e.val();

            if (!isNaN(newValue)) {
                that.notifyValueChange(newValue);
                currentValue = newValue;
            }
            else {
                that.setValue(currentValue);
            }
        });
    };

    that.setValue = function setValue(value) {
        currentValue = value;
        that.getEditor().val(value);
    };

    return that;
};

fe.jquery.dsl.numberEditor = fe.dsl.elementConstructor('numberEditor');