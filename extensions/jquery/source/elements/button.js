
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

    return that;
};