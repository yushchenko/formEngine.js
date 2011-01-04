
fe.engine = function engine(config) {

    var that = {},
        receivers = {},
        rules = [];

    function addReceiver(id, receiver) {

        if (typeof id !== 'string') {
            throw new Error(msg.receiverIdMustBeString);
        }
        if (!receiver || typeof receiver.receiveMessage !== 'function') {
            throw new Error(msg.noReceiveMessageMethod);
        }
        if (id in receivers) {
            throw new Error(msg.notUniqueReceiverId);
        }

        receivers[id] = receiver;
    }

    function addRule(rule) {

        if (typeof rule.receiverId !== 'string') {
            throw new Error(msg.noReceiverId);
        }

        var r = {},
            properties = ['senderId', 'path', 'signal'],
            checkers = ['checkSender', 'checkPath', 'checkSignal'],
            checkStartWith = [false, true, false],
            i, len;

        r.receiverId = rule.receiverId;

        function addChecker(property, checker, checkStartWith) {

            if (property) {
                r[checker] = function (msgProperty) {
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
            addChecker(rule[properties[i]], checkers[i], checkStartWith[i]);
        }

        r.transformData = function transformData(data, path) {
            var len;
            if (data !== undefined && typeof path === 'string' && typeof rule.path === 'string' && rule.path.length > path.length) {
                len = path.length;
                return getByPath(data, rule.path.slice(len > 0 ? len + 1: len));
            }
            return data;
        };

        rules.push(r);
    }

    function addRules(/*rules in array or arguments*/) {

        var i, l = arguments.length,
            ii, ll;

        for(i = 0; i < l; i += 1) {
            if (arguments[i].length) {
                for (ii = 0, ll = arguments[i].length; ii < ll; ii += 1) {
                    addRule(arguments[i][ii]);
                }
            } else {
                addRule(arguments[i]);
            }
        }
    }

    function addTrigger(trigger) {
    }

    function addTriggers(/* triggers in array or argumenst */) {
    }

    function sendMessage(message) {

        var i, len = rules.length, rule;

        for (i = 0; i < len; i += 1) {
            rule = rules[i];

            if (message.senderId === rule.receiverId) {
                continue;
            }

            if ((!rule.checkSender || rule.checkSender(message.senderId)) &&
                (!rule.checkPath || rule.checkPath(message.path)) &&
                (!rule.checkSignal || rule.checkSignal(message.signal))) {

                if (!(rule.receiverId in receivers)) {
                    throw new Error(msg.receiverNotFound);
                }

                receivers[rule.receiverId].receiveMessage({
                    senderId: message.senderId,
                    path: message.path,
                    signal: message.signal,
                    data: rule.transformData(message.data, message.path)
                });
            }
        }
    }

    that.addReceiver = addReceiver;
    that.addRule = addRule;
    that.addRules = addRules;
    that.addTrigger = addTrigger;
    that.addTriggers = addTriggers;
    that.sendMessage = sendMessage;
    
    return that;
};