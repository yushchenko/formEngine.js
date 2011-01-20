fe.element = function element (config) {

    var that = {},
        engine = config.engine,
        metadata = config.metadata || {},
        messageMap = {
            value: 'setValue',
            hidden: 'setHidden',
            readonly: 'setReadonly',
            error: 'showErrors'
        };

    that.id =  metadata.id || getUniqueId();
    that.properties = metadata.properties || {};
    that.children = [];
    that.parent = undefined;

    function initialize() {
    }

    function addElement(child) {
        that.children.push(child);
        child.parent = that;
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

    function setHidden(hidden) {
        that.hidden = hidden;
        notifyValidationStatusChange();
    }

    function setReadonly(readonly) {
        that.readonly = readonly;
        notifyValidationStatusChange();
    }

    function isHidden() {
        return !!that.hidden || (that.parent && that.parent.isHidden());
    }

    function isReadonly() {
        return !!that.readonly;
    }

    function notifyValidationStatusChange() {

        engine.sendMessage({ senderId: that.id, signal: 'validation-inactive',
                             data: that.isHidden() || that.isReadonly() });


        eachChild(function(child) {
            child.notifyValidationStatusChange();
        });

    }

    function eachChild(fn) {
        var i, len;
        for (i =0, len = that.children.length; i < len; i += 1) {
            fn(that.children[i], i);
        }
    }

    that.initialize = initialize;
    that.addElement = addElement;
    that.receiveMessage = receiveMessage;
    that.notifyValueChange = notifyValueChange;
    that.setHidden = setHidden;
    that.setReadonly = setReadonly;
    that.isHidden = isHidden;
    that.isReadonly = isReadonly;
    that.notifyValidationStatusChange = notifyValidationStatusChange;
    that.eachChild = eachChild;

    engine.addReceiver(that.id, that);

    return that;
};