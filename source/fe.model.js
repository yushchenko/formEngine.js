fe.model = function model(config) {

    config = config || {};

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        data = {};

    function receiveMessage(msg) {
        if (msg.signal === 'value' && typeof msg.path === 'string') {
            setByPath(data, msg.path, msg.data);
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

    /* Utilities
     ****************************************************************/

    function notifyUpdate(path, value) {
        if (!engine) {
            return;
        }
        engine.sendMessage({ senderId: id, path: path, signal: 'value', data: value });
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;

    if (engine) {
        engine.addReceiver(id, that);
        engine.addRule({ receiverId: id, signal: 'value' });
        engine.addModel(that);
    }

    return that;
};