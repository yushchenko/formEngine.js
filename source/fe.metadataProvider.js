fe.metadataProvider = function metadataProvider (config) {

    var that = {},
        modelMetadata = [],
        viewMetadata = {},
        rules = [],
        triggers = [],
        expressionProperties = ['hidden', 'readonly'];

    function parseMetadata(metadata, element) {

        var name, i, len, child, property, expression, parsed, id;

        element = element || viewMetadata;

        element.id = metadata.id || getUniqueId();
        element.typeName = metadata.typeName;
        element.properties = metadata.properties || {};

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

        for (i = 0, len = expressionProperties.length; i < len; i += 1) {

            property = expressionProperties[i];
            expression = metadata[property];

            if (typeof expression === 'string') {
                parsed = parseExpression(expression);
                id = getUniqueId();

                triggers.push({
                    id: id,
                    processorArgs: parsed.args,
                    processor: parsed.processor,
                    signal: property
                });

                rules.push({ receiverId: id, path: parsed.args, signal: 'value' });
                rules.push({ receiverId: element.id, senderId: id, signal: property });
            }
        }
    }

    function parseExpression(expression) {

        var result = { args: [] },
            argRe = /[a-zA-Z_\$][\w\$]*(?:\.?[a-zA-Z_\$][\w\$]*)+/g,
            matches,
            source = expression,
            i, len;

        while((matches = argRe.exec(expression)) !== null) {
            result.args.push(matches[0]);
        }

        for (i = 0, len = result.args.length; i < len; i += 1) {
            source = source.replace(result.args[i], 'arguments[' + i + ']');
        }

        result.processor = new Function('return ' + source + ';');

        return result;
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