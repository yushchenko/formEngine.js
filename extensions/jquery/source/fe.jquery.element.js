
fe.jquery.element = function jqueryElement(config) {

    var that = fe.element(config),
        editorQuery, containerQuery;

    that.editorId = that.id.replace(/\./g, '_');
    that.containerId = 'c_' + that.editorId;

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

    function setHidden(hidden) {
        var container = that.getContainer();
        if (container) {
            container.toggleClass('fe-hidden', hidden);
        }
    }

    function setReadonly(readonly) {
        var editor = that.getEditor();
        if (editor) {
            editor.get(0).disabled = readonly;
        }
    }

    that.initialize = initialize;
    that.getMarkup = getMarkup;

    that.getEditor = getEditor;
    that.getContainer = getContainer;

    that.setHidden = setHidden;
    that.setReadonly = setReadonly;

    return that;
};


