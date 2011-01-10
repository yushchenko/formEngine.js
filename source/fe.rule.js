
fe.rule = function rule(config) {

    var that = {},
        properties = ['senderId', 'path', 'signal'],
        checkers = ['checkSender', 'checkPath', 'checkSignal'],
        checkStartWith = [false, true, false],
        i, len;

    that.receiverId = config.receiverId;
    that.path = config.path;

    function addChecker(property, checker, checkStartWith) {

        if (property) {
            that[checker] = function (msgProperty) {
                var ii, ll;
                if (typeof property === 'string') {
                    return checkStartWith ? property.indexOf(msgProperty) === 0
                                          : property === msgProperty;
                }
                if (typeof property === 'object' && property.length) {
                    for (ii = 0, ll = property.length; ii < ll; ii += 1) {
                        if (checkStartWith ? property[ii].indexOf(msgProperty) === 0
                                           : property === msgProperty[ii]) {
                            return true;
                        }
                    }
                    return false;
                }
                return true;
            };
        }
    }

    for (i = 0, len = properties.length; i < len; i += 1) {
        addChecker(config[properties[i]], checkers[i], checkStartWith[i]);
    }

    that.transformData = function transformData(data, path) {
        var len;
        if (data !== undefined && typeof path === 'string' &&
            typeof config.path === 'string' && config.path.length > path.length) {

            len = path.length;
            return getByPath(data, config.path.slice(len > 0 ? len + 1: len));
        }
        return data;
    };

    return that;
};