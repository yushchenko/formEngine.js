
fe.trigger = function trigger(config) {

    var that = {},
        id = config.id,
        engine = config.engine,
        processor = config.processor,
        processorArgs = config.processorArgs,
        signal = config.signal;

    function receiveMessage(messsage) {

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