
fe.jquery.elements.panel = function panel(config) {

    var that = fe.jquery.element(config);

    that.template = template('<div id="<%=containerId%>" class="fe-element fe-panel"><%=content%></div>');

    return that;
};

fe.jquery.dsl.panel = fe.dsl.elementConstructor('panel');