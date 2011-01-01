
fe.model = function model(config) {

    var that = {},
        data = {};

    function receiveMessage(message) {
        
    }

    function set(/* [path], value */) {

        var parts, i, len, target, value;

        if (arguments.length === 1) {
            data = arguments[0];
            return;
        }

        parts = arguments[0].split('.');
        len = parts.length - 1;
        value = arguments[1];
        target = data;
        
        for (i = 0; i < len; i += 1) {
            target = target[parts[i]];
            if (target === undefined) {
                return;
            }
        }
        target[parts[len]] = value;
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

    return that;
};