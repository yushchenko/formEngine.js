fe.metadataProvider = function metadataProvider (config) {

    var that = {},
        modelMetadata = { validationRules: [] },
        viewMetadata = {},
        rules = [],
        triggers = [],
        expressionProperties = config.expressionProperties || ['value', 'hidden', 'readonly'],
        expressionParser = config.expressionParser || fe.expressionParser;

    function parseMetadata(metadata, element) {

        var name, i, len, child,
            validationRules = [];

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
            validationRules = parseValidationRules(metadata, element);

            rules.push({ receiverId: element.id, path: metadata.binding, signal: ['value', 'error'] });
        }

        parseExpressionProperties(metadata, element, validationRules);
    }

    function parseValidationRules(metadata, element) {

        var name, properties, validator, id,
            path = metadata.binding,
            validationRules = metadata.validationRules,
            rule, result = [];
        
        for (name in validationRules) {

            if (validationRules.hasOwnProperty(name)) {

                validator = fe.validators[name];

                if (validator === undefined) {
                    throw new Error(msg.unknownValidator + name);
                }

                if (typeof validationRules[name] === 'object') {
                    properties = validationRules[name];
                }
                else if (typeof validator.defaultProperty === 'string') {
                    properties = {};
                    properties[validator.defaultProperty] = validationRules[name];
                }

                id = getUniqueId();

                rule = {
                    id: id, path: path, validatorName: name, validatorProperties: properties
                };

                result.push(rule);
                modelMetadata.validationRules.push(rule);
            }
        }

        return result;
    }

    function parseExpressionProperties(metadata, element, validationRules) {

        var i, l, ii, ll,  property, expression, parsed, id;

        for (i = 0, l = expressionProperties.length; i < l; i += 1) {

            property = expressionProperties[i];
            expression = metadata[property];

            if (typeof expression === 'string') {
                parsed = expressionParser(expression);
                id = getUniqueId();

                triggers.push({
                    id: id,
                    processorArgs: parsed.args,
                    processor: parsed.processor,
                    signal: property
                });

                rules.push({ receiverId: id, path: parsed.args, signal: 'value' });
                rules.push({ receiverId: element.id, senderId: id, signal: property });

                for (ii = 0, ll = validationRules.length; ii < ll; ii += 1) {
                    rules.push({ receiverId: validationRules[ii].id, senderId: id, signal: property });
                }
            }
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