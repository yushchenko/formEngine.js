fe.element = function element (config) {

    var that = {},
        engine = config.engine,
        metadata = config.metadata || {},
        messageMap = {
            value: 'setValue',
            hidden: 'setHidden',
            readonly: 'setReadonly'
        };

    that.id =  metadata.id || getUniqueId();
    that.properties = metadata.properties || {};
    that.children = [];

    function initialize() {
    }

    function receiveMessage(message) {

        var methodName = messageMap[message.signal];

        if (methodName && typeof that[methodName] === 'function') {
            that[methodName](message.data);
        }
    }

    function notifyValueChange(value) {

        var path = that.properties.binding;

        if (typeof path === 'string') {
            engine.sendMessage({ senderId: that.id, path: path, signal: 'value', data: value });            
        } else {
            throw new Error(msg.elementWithoutBinding);
        }
    }

    that.initialize = initialize;
    that.receiveMessage = receiveMessage;
    that.notifyValueChange = notifyValueChange;

    engine.addReceiver(that.id, that);

    return that;
};