fe.metadataProvider = function metadataProvider (config) {

    var that = {},
        modelMetadata = { validationRules: [] },
        viewMetadata = {},
        rules = [],
        triggers = [],
        expressionProperties = config.expressionProperties || ['value', 'hidden', 'readonly'],
        expressionParser = config.expressionParser || fe.expressionParser;

    function parseMetadata(metadata, element, parent) {

        var name, i, len, child;

        element = element || viewMetadata;

        element.id = metadata.id || getUniqueId();
        element.typeName = metadata.typeName;
        element.properties = metadata.properties || {};

        parseExpressionProperties(metadata, element);

        if (typeof metadata.binding === 'string') {
            element.properties.binding = metadata.binding;

            // validation rules make sense only for data bound fields
            parseValidationRules(metadata, element);

            rules.push({ receiverId: element.id, path: metadata.binding, signal: ['value', 'error', 'change'] });
        }

        if (metadata.elements && metadata.elements.length) {

            element.elements = [];

            for (i = 0, len = metadata.elements.length; i < len; i += 1) {
                child = {};
                parseMetadata(metadata.elements[i], child, element);
                element.elements.push(child);
            }
        }
    }


    function parseExpressionProperties(metadata, element) {

        var i, l, ii, ll,  property, expression, parsed, id, trigger;

        for (i = 0, l = expressionProperties.length; i < l; i += 1) {

            property = expressionProperties[i];
            expression = metadata[property];

            if (typeof expression === 'string') {

                parsed = expressionParser(expression);
                id = getUniqueId();

                trigger = {
                    id: id,
                    processorArgs: parsed.args,
                    processor: parsed.processor,
                    signal: property
                };

                triggers.push(trigger);

                rules.push({ receiverId: id, path: parsed.args, signal: 'value' });
                rules.push({ receiverId: element.id, senderId: id, signal: property });
            }
        }
    }

    function parseValidationRules(metadata, element) {

        var name, properties, validator, id,
            path = metadata.binding,
            validationRules = metadata.validationRules || {};

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

                modelMetadata.validationRules.push({
                    id: id, path: path, validatorName: name, validatorProperties: properties
                });

                rules.push({ receiverId: id, senderId: element.id, signal: 'validation-inactive' });
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