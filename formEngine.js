/*
 * FormEngine.js - MVC on steroids :)
 * http://github.com/yushchenko/formEngine.js
 *
 * Copyright 2010, Valery Yushchenko (http://www.yushchenko.name)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 */

(function( global, undefined ) {

 
var fe = {
    version: '0.0.1'
};


/* Private functions
 **********************************************************************/
var nextUniqueId = 0;

function getUniqueId() {
    nextUniqueId += 1;
    return 'i' + nextUniqueId;
}

function getByPath(obj, path) {

    var parts, i, len, result;

    parts = path.split('.');
    result = obj;
    
    for (i = 0, len = parts.length; i < len; i += 1) {
        result = result[parts[i]];
        if (result === undefined) {
            return undefined;
        }
    }
    return result;
}

function setByPath(obj, path, value) {

    var parts = path.split('.'),
    i, len = parts.length - 1,
    target = obj;
    
    for (i = 0; i < len; i += 1) {
        target = target[parts[i]];
        if (target === undefined) {
            return;
        }
    }

    target[parts[len]] = value;
}
fe.engine = function engine(config) {

    var that = {},
        receivers = {},
        rules = [];

    function addReceiver(id, receiver) {

        if (id in receivers) {
            throw new Error('engine.addReceiver: recevier with given ID has been already added.');
        }
        if (typeof id !== 'string') {
            throw new Error('engine.addReceiver: id must be string');
        }
        if (!receiver || typeof receiver.receiveMessage !== 'function') {
            throw new Error('engine.addReceiver: receiver should have method "receiveMessage"');
        }

        receivers[id] = receiver;
    }

    function addRule(rule) {

        if (typeof rule.receiverId !== 'string') {
            throw new Error('engine.addRule: rule must have receiverId property, type string');
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
            if (typeof path === 'string' && typeof rule.path === 'string' && rule.path.length > path.length) {
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

    function sendMessage(message) {

        var i, len = rules.length, rule;

        function send() {
            receivers[rule.receiverId].receiveMessage(message);
        }

        for (i = 0; i < len; i += 1) {
            rule = rules[i];

            if (message.senderId === rule.receiverId) {
                continue;
            }

            if ((!rule.checkSender || rule.checkSender(message.senderId)) &&
                (!rule.checkPath || rule.checkPath(message.path)) &&
                (!rule.checkSignal || rule.checkSignal(message.signal))) {

                if (message.data) {
                    message.data = rule.transformData(message.data, message.path);
                }

                send();
            }
        }
    }

    that.addReceiver = addReceiver;
    that.addRule = addRule;
    that.addRules = addRules;
    that.addTrigger = addTrigger;
    that.sendMessage = sendMessage;
    
    return that;
};
fe.model = function model(config) {

    config = config || {};

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        data = {};

    function receiveMessage(msg) {
        if (msg.signal === 'value' && typeof msg.path === 'string') {
            setByPath(data, msg.path, msg.data);
        }
    }

    function set(/* [path], value */) {

        if (arguments.length === 1) {
            data = arguments[0];
            notifyUpdate('', data);
            return;
        }

        var path = arguments[0],
            value = arguments[1];

        setByPath(data, path, value);
        notifyUpdate(path, value);
    }

    function get(path) {

        if (path === undefined) {
            return data;
        }

        return getByPath(data, path);
    }

    /* Utilities
     ****************************************************************/

    function bindToEngine() {
        if (engine) {
            engine.addReceiver(id, that);
            engine.addRule({ receiverId: id, signal: 'value' });
        }
    }

    function notifyUpdate(path, value) {
        if (!engine) {
            return;
        }
        engine.sendMessage({ senderId: id, path: path, signal: 'value', data: value });
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;

    bindToEngine();

    return that;
};
fe.view = function view (config) {

    var that = {},
        engine = config.engine,
        elementTypes = config.elementTypes,
        defaultElementType = config.defaultElementType,
        elementsById = {};

    function createElement(metadata) {

        var ctor = elementTypes[metadata.typeName] || defaultElementType,
            element = ctor({ metadata: metadata, engine: engine }),
            i, len;

        if(element.id in elementsById) {
            throw new Error('view: element id duplication.');
        }

        elementsById[element.id] = element;
        
        if (metadata.children && metadata.children.length) {
            for (i = 0, len = metadata.children.length; i < len; i += 1) {
                element.children.push(createElement(metadata.children[i]));
            }
        }
        
        return element;
    }

    function initialize() {
        that.element.initialize();
    }

    function getElementById(id) {
        return elementsById[id];
    }

    that.element = createElement(config.metadata);

    that.initialize = initialize;
    that.getElementById = getElementById;

    return that;
};
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
fe.metadataProvider = function metadataProvider (config) {

    var that = {};

    function getModelMetadata() {
    }

    function getViewMetadata() {
    }

    function getRules() {
    }

    function getTriggers() {
    }

    that.getModelMetadata = getModelMetadata;
    that.getViewMetadata = getViewMetadata;
    that.getRules = getRules;
    that.getTriggers = getTriggers;

    return that;
};
global.fe = fe;

})((function () { return this; })());
