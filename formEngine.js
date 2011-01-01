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
                r[checker] = function (arg) {
                    var ii, ll;
                    if (typeof property === 'string') {
                        return checkStartWith ? arg.indexOf(property) === 0 : arg === property;
                    }
                    if (typeof property === 'object' && property.length) {
                        for (ii = 0, ll = property.length; ii < ll; ii += 1) {
                            if (checkStartWith ? arg.indexOf(property[ii]) === 0 : arg === property[ii]) {
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

    var that = {},
        data = {};

    function receiveMessage(message) {
        
    }

    function set(/* [path], value */) {

        var parts, i, len, target, value;

        if (arguments.length === 1) {
            data = arguments[0];
            return;
        }

        parts = arguments[0].split('.');
        len = parts.length - 1;
        value = arguments[1];
        target = data;
        
        for (i = 0; i < len; i += 1) {
            target = target[parts[i]];
            if (target === undefined) {
                return;
            }
        }
        target[parts[len]] = value;
    }

    function get(path) {

        var parts, i, len, result;

        if (path === undefined) {
            return data;
        }

        parts = path.split('.');
        result = data;
        
        for (i = 0, len = parts.length; i < len; i += 1) {
            result = result[parts[i]];
            if (result === undefined) {
                return undefined;
            }
        }
        return result;
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;

    return that;
};
fe.view = function view (config) {

    var that = {};

    function receiveMessage(message) {
        
    }

    that.receiveMessage = receiveMessage;

    return that;
};
})((function () { return this; })());
