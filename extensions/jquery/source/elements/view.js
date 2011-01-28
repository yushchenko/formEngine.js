
fe.jquery.elements.view = function view(config) {

    var that = fe.jquery.element(config);

    that.template = template('<div id="<%=containerId%>"><%=content%></div>');

    that.doInitialize = function doInitialize() {

        var viewContainerId = that.properties.viewContainerId;

        if (typeof viewContainerId !== 'string') {
            throw new Error(msg.undefinedViewContainerId);
        }

        document.getElementById(viewContainerId).innerHTML = that.getMarkup();
    };

    return that;
};

fe.jquery.dsl.view = fe.dsl.elementConstructor('view', {}, {
    container: function(containerId) {
        this.element.properties.viewContainerId = containerId;
        return this.chain;
    }
});