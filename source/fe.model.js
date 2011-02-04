fe.model = function model(config) {

    config = config || {};

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        data = {},
        validationRules = [],
        changeTracker = config.trackChanges ? fe.changeTracker() : undefined;

    function initialize() {

        var rules = (config.metadata || {}).validationRules || [],
            i, len = rules.length, r;

        for (i = 0; i < len; i += 1) {

            r = rules[i];

            validationRules.push(fe.validationRule({
                id: r.id, engine: engine, path: r.path,
                validatorName: r.validatorName,
                validatorProperties: r.validatorProperties
            }));
        }
    }

    function receiveMessage(msg) {

        if (msg.signal === 'value' && typeof msg.path === 'string') {

            if (changeTracker) {
                changeTracker.push({ path: msg.path, oldValue: get(msg.path), newValue: msg.data });
                notifyChange(msg.path);
            }

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

            msg = rule.validate(data);

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

    function undo() {
        move('back');
    }

    function redo() {
        move('forward');
    }

    function move(direction) {

        if (!changeTracker) {
            return;
        }

        var change = changeTracker[{back: 'moveBack', forward: 'moveForward'}[direction]]();

        if (change) {
            set(change.path, change[{back: 'oldValue', forward: 'newValue'}[direction]]);
            notifyChange(change.path);
        }
    }

    function getUndoCount() {

        if (!changeTracker) {
            return undefined;
        }

        return changeTracker.getBackCount();
    }

    function getRedoCount() {

        if (!changeTracker) {
            return undefined;
        }

        return changeTracker.getForwardCount();
    }

    function markSave() {

        if (!changeTracker) {
            return;
        }

        var i, saved = changeTracker.markSave();

        for (i = 0; i < saved.length; i += 1) {
            notifyChange(saved[i], 'saved');
        }
    }

    /* Utilities
     ****************************************************************/

    function notifyUpdate(path, value) {
        engine.sendMessage({ senderId: id, path: path, signal: 'value', data: value });
    }

    function notifyError(path, messages) {
        engine.sendMessage({ senderId: id, path: path, signal: 'error', data: messages });
    }

    function notifyChange(path, status) {
        engine.sendMessage({ senderId: id, path: path, signal: 'change',
                             data: status || changeTracker.getStatus(path) });
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;
    that.validate = validate;
    that.undo = undo;
    that.redo = redo;
    that.getUndoCount = getUndoCount;
    that.getRedoCount = getRedoCount;
    that.markSave = markSave;

    initialize();
    engine.addReceiver(id, that);
    engine.addRule({ receiverId: id, signal: 'value' });
    engine.addModel(that);

    return that;
};