fe.element = function element (config) {

    var that = {},
        engine = config.engine,
        metadata = config.metadata || {},
        messageMap = {
            value: 'setValue',
            hidden: 'setHidden',
            readonly: 'setReadonly',
            error: 'showErrors',
            change: 'setStatus'
        };

    that.id =  metadata.id || getUniqueId();
    that.properties = metadata.properties || {};
    that.validationRules = metadata.validationRules || {};
    that.elements = [];
    that.parent = undefined;

    console.log('ctor: ' + JSON.stringify(that.validationRules));

    function initialize() {
    }

    function addElement(child) {
        that.elements.push(child);
        child.parent = that;
    }

    function receiveMessage(message) {

        var methodName = messageMap[message.signal];

        if (methodName && typeof that[methodName] === 'function') {
            that[methodName](message.data);
        }
    }

    function setValue(value) {
        
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

        that.notifyRequiredStatusChange();

        eachChild(function(child) {
            child.notifyValidationStatusChange();
        });
    }

    function showErrors(errors) {
        
    }

    function notifyRequiredStatusChange() {
        that.markRequired('required' in that.validationRules
                          && !that.isHidden() && !that.isReadonly());
    }

    function markRequired(required) {
        
    }

    function eachChild(fn) {
        var i, len;
        for (i =0, len = that.elements.length; i < len; i += 1) {
            fn(that.elements[i], i);
        }
    }

    that.initialize = initialize;
    that.addElement = addElement;
    that.receiveMessage = receiveMessage;
    that.setValue = setValue();
    that.notifyValueChange = notifyValueChange;
    that.setHidden = setHidden;
    that.setReadonly = setReadonly;
    that.isHidden = isHidden;
    that.isReadonly = isReadonly;
    that.notifyValidationStatusChange = notifyValidationStatusChange;
    that.showErrors = showErrors;
    that.notifyRequiredStatusChange = notifyRequiredStatusChange;
    that.markRequired = markRequired;
    that.eachChild = eachChild;

    engine.addReceiver(that.id, that);

    return that;
};