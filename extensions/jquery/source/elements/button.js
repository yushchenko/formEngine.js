
fe.jquery.elements.button = function button(config) {

    var that = fe.jquery.element(config),
        engine = config.engine;

    that.template = template('<span id="<%=editorId%>"><%=properties.label%></span>');

    that.initialize = function() {
        that.getEditor()
            .button({ icons: { primary: that.properties.icon } })
            .click(function() {
                engine.sendMessage({ senderId: that.id, signal: 'click' });
            });
    };

    that.setHidden = function setHidden(hidden) {
        that.getEditor().toggleClass('fe-hidden', hidden);
    };

    that.setReadonly = function setReadonly(readonly) {
        that.getEditor().button(readonly ? 'disable' : 'enable');
    };

    return that;
};

fe.jquery.dsl.button = fe.dsl.token('button', {
    icon: function(icon) {
        this.element.properties.icon = icon;
        return this.chain;
    }
});