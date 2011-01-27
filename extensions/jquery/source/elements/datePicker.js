
fe.jquery.elements.datePicker = function datePicker(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<input type="text" id="<%=editorId%>" class="fe-editor-narrow"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.initialize = function() {

        var e = that.getEditor().datepicker();

        e.change(function() {
            that.notifyValueChange(e.datepicker('getDate'));
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().datepicker('setDate', value);
    };

    return that;
};

fe.jquery.dsl.datePicker = fe.dsl.token('datePicker');