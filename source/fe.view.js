fe.view = function view (config) {

    var that = {},
        engine = config.engine,
        elementTypes = config.elementTypes,
        defaultElementType = config.defaultElementType || fe.element,
        elementsById = {};

    function createElement(metadata) {

        var ctor = elementTypes[metadata.typeName] || defaultElementType,
            element = ctor({ metadata: metadata, engine: engine }),
            i, len;

        elementsById[element.id] = element;
        
        if (metadata.children && metadata.children.length) {
            for (i = 0, len = metadata.children.length; i < len; i += 1) {
                element.addElement(createElement(metadata.children[i]));
            }
        }
        
        return element;
    }

    function initialize() {
        that.element.initialize();
    }

    function getElementById(id) {
        return elementsById[id];
    }

    that.element = createElement(config.metadata);

    that.initialize = initialize;
    that.getElementById = getElementById;

    return that;
};