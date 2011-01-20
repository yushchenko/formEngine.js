fe.validationRule = function(config) {

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        path = config.path,
        validator = fe.validators[config.validatorName],
        validatorProperties = config.validatorProperties || {},
        inactive;

    function receiveMessage(msg) {
        if (msg.signal === 'validation-inactive') {
            inactive = msg.data;
        }
    }

    function validate(data) {

        if (inactive) {
            return undefined;
        }

        var value = getByPath(data, path);
        return validator(value, validatorProperties);
    }

    that.receiveMessage = receiveMessage;
    that.validate = validate;
    that.path = path;

    engine.addReceiver(id, that);

    return that;
};