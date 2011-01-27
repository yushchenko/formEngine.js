
fe.jquery.elements.toolBar = function toolBar(config) {

    var that = fe.jquery.element(config);

    that.template = template('<div id="<%=containerId%>" class="fe-element fe-toolbar"><%=content%></div>');

    return that;
};

fe.jquery.dsl.toolBar = fe.dsl.token('toolBar');