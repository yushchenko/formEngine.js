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

    function addRule(ruleConfig) {

        if (typeof ruleConfig.receiverId !== 'string') {
            throw new Error(msg.noReceiverId);
        }

        rules.push(fe.rule(ruleConfig));
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