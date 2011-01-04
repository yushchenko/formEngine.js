
fe.metadataProvider = function metadataProvider (config) {

    var that = {},
        modelMetadata = [],
        viewMetadata = {},
        rules = [],
        triggers = [];

    function parseMetadata(metadata, element) {

        var name, i, len, child;

        element = element || viewMetadata;

        element.id = metadata.id || getUniqueId();
        element.typeName = metadata.typeName;
        element.properties = metadata.properties || {};

        // for (name in metadata.properties) {
        //     if (metadata.properties.hasOwnProperty(name)) {
        //         element.properties[name] = metadata.properties[name];
        //     }
        // }

        if (metadata.children && metadata.children.length) {

            element.children = [];

            for (i = 0, len = metadata.children.length; i < len; i += 1) {
                child = {};
                parseMetadata(metadata.children[i], child);
                element.children.push(child);
            }
        }

        if (typeof metadata.binding === 'string') {
            rules.push({ receiverId: element.id, path: metadata.binding, signal: 'value' });
            element.properties.binding = metadata.binding;
        }
    }

    function getModelMetadata() {
        return modelMetadata;
    }

    function getViewMetadata() {
        return viewMetadata;
    }

    function getRules() {
        return rules;
    }

    function getTriggers() {
        return triggers;
    }

    that.getModelMetadata = getModelMetadata;
    that.getViewMetadata = getViewMetadata;
    that.getRules = getRules;
    that.getTriggers = getTriggers;

    parseMetadata(config.metadata);

    return that;
};