
fe.element = function element (config) {

    var that = {},
        engine = config.engine,
        metadata = config.metadata || {};

    that.id =  metadata.id || getUniqueId();
    that.properties = metadata.properties || {};
    that.children = [];

    function initialize() {
    }

    function receiveMessage(message) {
    }

    function notifyValueChange(value) {
    }

    that.initialize = initialize;
    that.receiveMessage = receiveMessage;
    that.notifyValueChange = notifyValueChange;

    return that;
};