
fe.model = function model(config) {

    config = config || {};

    var that = {},
        id = config.id || fe.getUniqueId(),
        engine = config.engine,
        data = {};

    function bindToEngine() {
        if (engine) {
            engine.addReceiver(id, that);
            engine.addRule({ receiverId: id, signal: 'value' });
        }
    }

    function receiveMessage(msg) {
        if (msg.signal === 'value' && typeof msg.path === 'string') {
            doSet(msg.path, msg.data);
        }
    }

    function doSet(path, value) {

        var parts = path.split('.'),
            i, len = parts.length - 1,
            target = data;
        
        for (i = 0; i < len; i += 1) {
            target = target[parts[i]];
            if (target === undefined) {
                return;
            }
        }

        target[parts[len]] = value;
    }

    function set(/* [path], value */) {

        if (arguments.length === 1) {
            data = arguments[0];
            return;
        }

        doSet(arguments[0], arguments[1]);
    }

    function get(path) {

        var parts, i, len, result;

        if (path === undefined) {
            return data;
        }

        parts = path.split('.');
        result = data;
        
        for (i = 0, len = parts.length; i < len; i += 1) {
            result = result[parts[i]];
            if (result === undefined) {
                return undefined;
            }
        }
        return result;
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;

    bindToEngine();

    return that;
};