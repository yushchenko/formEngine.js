
fe.triggers = {};

fe.triggers.expression = function expressionTrigger(config) {

    var that = {},
        id = config.id,
        engine = config.engine,
        processor = config.processor,
        processorArgs = config.processorArgs,
        signal = config.signal;

    function receiveMessage(msg) {

        var args = [],
            i, len = processorArgs.length,
            result;

        for (i = 0; i < len; i += 1) {
            args.push(engine.get(processorArgs[i]));
        }

        result = processor.apply(undefined, args);

        engine.sendMessage({ senderId: id, signal: signal, data: result });
    }

    that.receiveMessage = receiveMessage;

    engine.addReceiver(id, that);

    return that;
};

fe.triggers.change = function changeTrigger(config) {

    var that = {},
        id = config.id,
        engine = config.engine,
        statusByPath = {};

    function receiveMessage(msg) {

        var result, path,
            count = { 'default': 0, changed: 0, saved: 0 }, total = 0;

        statusByPath[msg.path] = msg.data;

        for (path in statusByPath) {
            if (statusByPath.hasOwnProperty(path)) {
                count[statusByPath[path]] += 1;
                total += 1;
            }
        }

        result = (total === count['default']) ? 'default' :
                 (count.changed === 0) ? 'saved' : 'changed';

        engine.sendMessage({ senderId: id, signal: 'change', data: result });
    }

    that.receiveMessage = receiveMessage;

    engine.addReceiver(id, that);

    return that;
};