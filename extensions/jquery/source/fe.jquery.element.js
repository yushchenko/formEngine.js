
fe.jquery.element = function jqueryElement(config) {

    var that = fe.element(config),
        setHiddenBase = that.setHidden,
        setReadonlyBase = that.setReadonly,
        editorQuery, containerQuery, errorQuery;

    that.editorId = that.id.replace(/\./g, '_');
    that.containerId = 'c_' + that.editorId;
    that.errorId = 'e_' + that.editorId;

    function initialize() {

        if (that.doInitialize) {
            that.doInitialize();
        }

        that.eachChild(function(child) {
            child.initialize();
        });
    }

    function getMarkup() {

        var tmpl  = that.template,
            content = '';

        that.eachChild(function(child) {
            content += child.getMarkup();
        });

        if (typeof tmpl === 'function') {
            return tmpl({
                editorId: that.editorId,
                containerId: that.containerId,
                errorId: that.errorId,
                content: content,
                properties: that.properties
            });
        }

        return content;
    }

    function getEditor() {
        if (editorQuery === undefined) {
            editorQuery = $('#' + that.editorId);
        }
        return editorQuery;
    }

    function getContainer() {
        if (containerQuery === undefined) {
            containerQuery = $('#' + that.containerId);
        }
        return containerQuery;
    }

    function getError() {
        if (errorQuery === undefined) {
            errorQuery = $('#' + that.errorId);
        }
        return errorQuery;
    }

    function setHidden(hidden) {
        var container = that.getContainer();
        if (container) {
            container.toggleClass('fe-hidden', hidden);
        }
        setHiddenBase(hidden);
    }

    function setReadonly(readonly) {
        var editor = that.getEditor();
        if (editor) {
            editor.get(0).disabled = readonly;
        }
        setReadonlyBase(readonly);
    }

    function showErrors(errors) {
        var error = that.getError();
        if(error) {
            error.html(errors.join('<br />'));
        }
    }

    that.initialize = initialize;
    that.getMarkup = getMarkup;

    that.getEditor = getEditor;
    that.getContainer = getContainer;
    that.getError = getError;

    that.setHidden = setHidden;
    that.setReadonly = setReadonly;
    that.showErrors = showErrors;

    return that;
};