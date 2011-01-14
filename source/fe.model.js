fe.model = function model(config) {

    config = config || {};

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        data = {},
        validationRules = (config.metadata || {}).validationRules || [];


    function receiveMessage(msg) {
        if (msg.signal === 'value' && typeof msg.path === 'string') {
            setByPath(data, msg.path, msg.data);
            validate(msg.path);
        }
    }

    function set(/* [path], value */) {

        if (arguments.length === 1) {
            data = arguments[0];
            notifyUpdate('', data);
            return;
        }

        var path = arguments[0],
            value = arguments[1];

        setByPath(data, path, value);
        notifyUpdate(path, value);
    }

    function get(path) {

        if (path === undefined) {
            return data;
        }

        return getByPath(data, path);
    }

    function validate(path, skipNotification) {

        var i, len, rule, validator, msg, errorPath,
            errorsByPath = {}, result = true;

        if (typeof path !== 'string') {
            path = '';
        }
        
        for (i = 0, len = validationRules.length; i < len; i += 1) {

            rule = validationRules[i];

            if (path && rule.path.indexOf(path) !== 0) {
                continue;
            }

            if (!errorsByPath.hasOwnProperty(rule.path)) {
                errorsByPath[rule.path] = [];
            }

            validator = fe.validators[rule.validatorName];
            msg = validator(getByPath(data, rule.path), rule.validatorProperties || {});

            if (msg !== undefined) {
                errorsByPath[rule.path].push(msg);
                result = false;
            }
        }

        if (!skipNotification) {
            for (errorPath in errorsByPath) {
                if (errorsByPath.hasOwnProperty(errorPath)) {
                    notifyError(errorPath, errorsByPath[errorPath]);
                }
            }
        }

        return result;
    }

    /* Utilities
     ****************************************************************/

    function notifyUpdate(path, value) {
        engine.sendMessage({ senderId: id, path: path, signal: 'value', data: value });
    }

    function notifyError(path, messages) {
        engine.sendMessage({ senderId: id, path: path, signal: 'error', data: messages });
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;
    that.validate = validate;

    if (engine) {
        engine.addReceiver(id, that);
        engine.addRule({ receiverId: id, signal: 'value' });
        engine.addModel(that);
    }

    return that;
};