fe.metadataProvider = function metadataProvider (config) {

    var that = {},
        modelMetadata = { validationRules: [] },
        viewMetadata = {},
        rules = [],
        triggers = [],
        expressionProperties = ['value', 'hidden', 'readonly'];

    function parseMetadata(metadata, element) {

        var name, i, len, child;

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
            element.properties.binding = metadata.binding;

            // validation rules make sense only for data bound fields
            parseValidationRules(metadata.validationRules || {}, metadata.binding);

            rules.push({ receiverId: element.id, path: metadata.binding, signal: ['value', 'error'] });
        }

        parseExpressionProperties(element, metadata);
    }

    function parseValidationRules(rules, path) {

        var name, properties, validator;
        
        for (name in rules) {

            if (rules.hasOwnProperty(name)) {

                validator = fe.validators[name];

                if (validator === undefined) {
                    throw new Error(msg.unknownValidator + name);
                }

                if (typeof rules[name] === 'object') {
                    properties = rules[name];
                }
                else if (typeof validator.defaultProperty === 'string') {
                    properties = {};
                    properties[validator.defaultProperty] = rules[name];
                }

                modelMetadata.validationRules.push({
                    path: path, validatorName: name, validatorProperties: properties
                });
            }
        }
    }

    function parseExpressionProperties(element, metadata) {

        var i, len, property, expression, parsed, id;

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
            toReplace = [],
            argRe = /\:([a-zA-Z_\$][\w\$]*(?:\.?[a-zA-Z_\$][\w\$]*)+)/g,
            matches,
            source = expression,
            i, len;

        while((matches = argRe.exec(expression)) !== null) {
            toReplace.push(matches[0]); // full expression with column line :customer.firstName
            result.args.push(matches[1]); // data path only
        }

        for (i = 0, len = toReplace.length; i < len; i += 1) {
            source = source.replace(toReplace[i], 'arguments[' + i + ']');
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