fe.validationRule = function(config) {

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        path = config.path,
        validator = fe.validators[config.validatorName],
        validatorProperties = config.validatorProperties || {},
        flags = {};

    function receiveMessage(msg) {
        flags[msg.signal] = msg.data; // set hidden or readonly flags
    }

    function validate(data) {

        if (flags.hidden || flags.readonly) {
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