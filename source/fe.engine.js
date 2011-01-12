fe.engine = function engine(config) {

    var that = {},
        receivers = {},
        rules = [],
        triggers = [],
        models = [];

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
        applyToArgs(arguments, addRule);
    }

    function addTrigger(triggerConfig) {
        triggerConfig.engine = that;
        triggers.push(fe.trigger(triggerConfig));
    }

    function addTriggers(/* triggers in array or argumenst */) {
        applyToArgs(arguments, addTrigger);
    }

    function addModel(model) {
        models.push(model);
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
                    rulePath: rule.path,
                    signal: message.signal,
                    data: rule.transformData(message.data, message.path)
                });
            }
        }
    }

    function get(path) {

        var i, len, value;

        for (i = 0, len = models.length; i < len; i += 1) {
            value = models[i].get(path);
            if (value !== undefined) {
                return value;
            }
        }

        return undefined;
    }

    that.addReceiver = addReceiver;
    that.addRule = addRule;
    that.addRules = addRules;
    that.addTrigger = addTrigger;
    that.addTriggers = addTriggers;
    that.addModel = addModel;
    that.sendMessage = sendMessage;
    that.get = get;
    
    return that;
};