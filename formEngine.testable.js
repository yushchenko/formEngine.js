var fe = {
    version: '0.0.1'
};


/* Private stuff
 **********************************************************************/
var nextUniqueId = 0,
    trimLeft = /^\s+/,
	trimRight = /\s+$/;

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
        if (result === undefined || result === null) {
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

function applyToArgs(args, fn) {

    var i, l = args.length,
        ii, ll;

    for(i = 0; i < l; i += 1) {
        if (typeof args[i].length === 'number') {
            for (ii = 0, ll = args[i].length; ii < ll; ii += 1) {
                fn(args[i][ii]);
            }
        } else {
            fn(args[i]);
        }
    }
}

// taken from jQuery
function trim(t) {
    //TODO: use native trim when available
    return t === null || t === undefined ? "" : t.toString().replace( trimLeft, "" ).replace( trimRight, "" );
}

function format(str, args) {

    var name;

    str = str || '';

    for (name in args) {
        if (args.hasOwnProperty(name)) {
            str = str.replace(new RegExp('{' + name + '}', 'g'), args[name]);
        }
    }
    return str;
}

function log(msg) {
    if (console !== undefined && typeof console.log === 'function') {
        console.log(msg);
    }
}

var msg = {
    notUniqueReceiverId: 'engine.addReceiver: recevier with given ID has been already added.',
    receiverIdMustBeString: 'engine.addReceiver: id must be string',
    noReceiveMessageMethod: 'engine.addReceiver: receiver should have method "receiveMessage" or be a function',
    noReceiverId: 'engine.addRule: rule must have receiverId property, type string',
    receiverNotFound: 'engine.sendMessage: receiver not found.',
    elementWithoutBinding: 'element.notifyValueChange: can\'t send notification if binding property not defined.',
    unknownValidator: 'metadataProvider: unknown validator: '
};
fe.dsl = {};

fe.dsl.defaultMethods = {

    id: function(id) {
        this.element.id = id;
        return this.chain;
    },

    property: function(name, value) {
        this.element.properties[name] = value;
        return this.chain;
    },

    label: function(label) {
        return fe.dsl.defaultMethods.property('label', label);
    },

    hidden: function(hidden) {
        this.element.hidden = hidden;
        return this.chain;
    },

    readonly: function(readonly) {
        this.element.readonly = readonly;
        return this.chain;
    },

    value: function(value) {
        this.element.value = value;
        return this.chain;
    },

    get: function() {
        return this.element;
    }
};

fe.dsl.token = function token(init, methods) {

    function that() {

        var element = { properties: {}, validationRules: {}, elements: [] };

        if (typeof init === 'function') {
            init(element);
        }

        function chain() {

            var i, len = arguments.length, arg;

            for (i = 0; i < len; i += 1) {
                arg = arguments[i];
                if (typeof arg === 'function' && typeof arg.get === 'function') {
                    element.elements.push(arg.get());
                }
            }

            return chain;
        }

        var context = { element: element, chain: chain };

        extend(chain, fe.dsl.defaultMethods, context);
        extend(chain, methods || {}, context);

        return chain.apply(undefined, arguments);
    }

    function extend(target, methods, context) {

        var name;

        function addMethod(name, fn) {
            target[name] = function() {
                return fn.apply(context, arguments);
            };
        }

        for (name in methods) {
            if (methods.hasOwnProperty(name)) {
                addMethod(name, methods[name]);
            }
        }
    }

    return that;
};

fe.dsl.element = fe.dsl.token();

fe.rule = function rule(config) {

    var that = {},
        properties = ['senderId', 'path', 'signal'],
        checkers = ['checkSender', 'checkPath', 'checkSignal'],
        checkStartWith = [false, true, false],
        i, len;

    that.receiverId = config.receiverId;
    that.path = config.path;

    function addChecker(property, checker, checkStartWith) {

        if (property) {
            that[checker] = function (msgProperty) {
                var ii, ll;
                if (typeof property === 'string') {
                    return checkStartWith ? property.indexOf(msgProperty) === 0
                                          : property === msgProperty;
                }
                if (typeof property === 'object' && property.length) {
                    for (ii = 0, ll = property.length; ii < ll; ii += 1) {
                        if (checkStartWith ? property[ii].indexOf(msgProperty) === 0
                                           : property[ii] === msgProperty) {
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
        addChecker(config[properties[i]], checkers[i], checkStartWith[i]);
    }

    that.transformData = function transformData(data, path) {
        var len;
        if (data !== undefined && typeof path === 'string' &&
            typeof config.path === 'string' && config.path.length > path.length) {

            len = path.length;
            return getByPath(data, config.path.slice(len > 0 ? len + 1: len));
        }
        return data;
    };

    return that;
};

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
        if (!receiver || (typeof receiver !== 'function' && typeof receiver.receiveMessage !== 'function')) {
            throw new Error(msg.noReceiveMessageMethod);
        }
        if (id in receivers) {
            throw new Error(msg.notUniqueReceiverId);
        }

        receivers[id] = typeof receiver !== 'function' ? receiver : { receiveMessage: receiver };
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

    function subscribe(ruleTemplate, fn) {
        var id = getUniqueId();
        addReceiver(id, fn);
        ruleTemplate.receiverId = id;
        addRule(ruleTemplate);
    }

    that.addReceiver = addReceiver;
    that.addRule = addRule;
    that.addRules = addRules;
    that.addTrigger = addTrigger;
    that.addTriggers = addTriggers;
    that.addModel = addModel;
    that.sendMessage = sendMessage;
    that.get = get;
    that.subscribe = subscribe;
    
    return that;
};
fe.validationRule = function(config) {

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        path = config.path,
        validator = fe.validators[config.validatorName],
        validatorProperties = config.validatorProperties || {},
        inactive;

    function receiveMessage(msg) {
        if (msg.signal === 'validation-inactive') {
            inactive = msg.data;
        }
    }

    function validate(data) {

        if (inactive) {
            return undefined;
        }

        var value = getByPath(data, path);
        return validator(value, validatorProperties);
    }

    that.receiveMessage = receiveMessage;
    that.validate = validate;
    that.path = path;

    engine.addReceiver(id, that);

    return that;
};
fe.model = function model(config) {

    config = config || {};

    var that = {},
        id = config.id || getUniqueId(),
        engine = config.engine,
        data = {},
        validationRules = [];

    function initialize() {

        var rules = (config.metadata || {}).validationRules || [],
            i, len = rules.length, r;

        for (i = 0; i < len; i += 1) {

            r = rules[i];

            validationRules.push(fe.validationRule({
                id: r.id, engine: engine, path: r.path,
                validatorName: r.validatorName,
                validatorProperties: r.validatorProperties
            }));
        }
    }

    function receiveMessage(msg) {
        if (msg.signal === 'value' && typeof msg.path === 'string') {
            setByPath(data, msg.path, msg.data);
            validate(msg.path);
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

    function validate(path, skipNotification) {

        var i, len, rule, validator, msg, errorPath,
            errorsByPath = {}, result = true;

        if (typeof path !== 'string') {
            path = '';
        }
        
        for (i = 0, len = validationRules.length; i < len; i += 1) {

            rule = validationRules[i];

            if (path && rule.path.indexOf(path) !== 0) {
                continue;
            }

            if (!errorsByPath.hasOwnProperty(rule.path)) {
                errorsByPath[rule.path] = [];
            }

            msg = rule.validate(data);

            if (msg !== undefined) {
                errorsByPath[rule.path].push(msg);
                result = false;
            }
        }

        if (!skipNotification) {
            for (errorPath in errorsByPath) {
                if (errorsByPath.hasOwnProperty(errorPath)) {
                    notifyError(errorPath, errorsByPath[errorPath]);
                }
            }
        }

        return result;
    }

    /* Utilities
     ****************************************************************/

    function notifyUpdate(path, value) {
        engine.sendMessage({ senderId: id, path: path, signal: 'value', data: value });
    }

    function notifyError(path, messages) {
        engine.sendMessage({ senderId: id, path: path, signal: 'error', data: messages });
    }

    that.receiveMessage = receiveMessage;
    that.set = set;
    that.get = get;
    that.validate = validate;

    initialize();
    engine.addReceiver(id, that);
    engine.addRule({ receiverId: id, signal: 'value' });
    engine.addModel(that);

    return that;
};
fe.validators = {};

fe.validators.required = function required(value, properties) {

    if (value === undefined || value === null || 
        (typeof value === 'string' && trim(value) === '') ||
        (typeof value === 'number' && isNaN(value))) {

        return format(properties.message || fe.validationMessages.required, properties);
    }

    return undefined;
};

fe.dsl.defaultMethods.required = function(arg) {
    this.element.validationRules.required = arg || true;
    return this.chain;
};

fe.validators.minLength = function minLength(value, properties) {

    if (value && value.length !== undefined && value.length < properties.length) {
        return format(properties.message || fe.validationMessages.minLenght, properties);
    }

    return undefined;
};
fe.validators.minLength.defaultProperty = 'length';

fe.dsl.defaultMethods.minLength = function(arg) {
    this.element.validationRules.minLength = arg;
    return this.chain;
};

fe.validators.maxLength = function maxLength(value, properties) {

    if (value && value.length !== undefined && value.length > properties.length) {
        return format(properties.message || fe.validationMessages.maxLenght, properties);
    }

    return undefined;
};
fe.validators.maxLength.defaultProperty = 'length';

fe.dsl.defaultMethods.maxLength = function(arg) {
    this.element.validationRules.maxLength = arg;
    return this.chain;
};

fe.validators.minValue = function minValue(value, properties) {

    if (value && value < properties.value) {
        return format(properties.message || fe.validationMessages.minValue, properties);
    }

    return undefined;
};
fe.validators.minValue.defaultProperty = 'value';

fe.dsl.defaultMethods.minValue = function(arg) {
    this.element.validationRules.minValue = arg;
    return this.chain;
};

fe.validators.maxValue = function maxValue(value, properties) {

    if (value && value > properties.value) {
        return format(properties.message || fe.validationMessages.maxValue, properties);
    }

    return undefined;
};
fe.validators.maxValue.defaultProperty = 'value';

fe.dsl.defaultMethods.maxValue = function(arg) {
    this.element.validationRules.maxValue = arg;
    return this.chain;
};

fe.validationMessages = {
    required: 'This field is required!',
    minLenght: 'This field should contain more that {length} symbols!',
    maxLenght: 'This field should contain less that {length} symbols!',
    minValue: 'This field should have value more that {value}!',
    maxValue: 'This field should have value less that {value}!'
};
fe.view = function view (config) {

    var that = {},
        engine = config.engine,
        elementTypes = config.elementTypes,
        defaultElementType = config.defaultElementType || fe.element,
        elementsById = {};

    function createElement(metadata) {

        var ctor = elementTypes[metadata.typeName] || defaultElementType,
            element = ctor({ metadata: metadata, engine: engine }),
            i, len;

        elementsById[element.id] = element;
        
        if (metadata.children && metadata.children.length) {
            for (i = 0, len = metadata.children.length; i < len; i += 1) {
                element.addElement(createElement(metadata.children[i]));
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


        eachChild(function(child) {
            child.notifyValidationStatusChange();
        });

    }

    function showErrors(errors) {
        
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
    that.setValue = setValue();
    that.notifyValueChange = notifyValueChange;
    that.setHidden = setHidden;
    that.setReadonly = setReadonly;
    that.isHidden = isHidden;
    that.isReadonly = isReadonly;
    that.notifyValidationStatusChange = notifyValidationStatusChange;
    that.showErrors = showErrors;
    that.eachChild = eachChild;

    engine.addReceiver(that.id, that);

    return that;
};
fe.expressionParser = function expressionParser(expression) {

    var result = { args: [] },
        toReplace = [],
        argRe = /\:([a-zA-Z_\$][\w\$]*(?:\.?[a-zA-Z_\$][\w\$]*)+)/g,
        matches, i, len,
        source = expression;

    while((matches = argRe.exec(expression)) !== null) {
        toReplace.push(matches[0]); // full expression with column line :customer.firstName
        result.args.push(matches[1]); // data path only
    }

    for (i = 0, len = toReplace.length; i < len; i += 1) {
        source = source.replace(toReplace[i], 'arguments[' + i + ']');
    }

    result.processor = new Function('return ' + source + ';');

    return result;
};
fe.metadataProvider = function metadataProvider (config) {

    var that = {},
        modelMetadata = { validationRules: [] },
        viewMetadata = {},
        rules = [],
        triggers = [],
        expressionProperties = config.expressionProperties || ['value', 'hidden', 'readonly'],
        expressionParser = config.expressionParser || fe.expressionParser;

    function parseMetadata(metadata, element, parent) {

        var name, i, len, child;

        element = element || viewMetadata;

        element.id = metadata.id || getUniqueId();
        element.typeName = metadata.typeName;
        element.properties = metadata.properties || {};

        parseExpressionProperties(metadata, element);

        if (typeof metadata.binding === 'string') {
            element.properties.binding = metadata.binding;

            // validation rules make sense only for data bound fields
            parseValidationRules(metadata, element);

            rules.push({ receiverId: element.id, path: metadata.binding, signal: ['value', 'error'] });
        }

        if (metadata.children && metadata.children.length) {

            element.children = [];

            for (i = 0, len = metadata.children.length; i < len; i += 1) {
                child = {};
                parseMetadata(metadata.children[i], child, element);
                element.children.push(child);
            }
        }
    }


    function parseExpressionProperties(metadata, element) {

        var i, l, ii, ll,  property, expression, parsed, id, trigger;

        for (i = 0, l = expressionProperties.length; i < l; i += 1) {

            property = expressionProperties[i];
            expression = metadata[property];

            if (typeof expression === 'string') {

                parsed = expressionParser(expression);
                id = getUniqueId();

                trigger = {
                    id: id,
                    processorArgs: parsed.args,
                    processor: parsed.processor,
                    signal: property
                };

                triggers.push(trigger);

                rules.push({ receiverId: id, path: parsed.args, signal: 'value' });
                rules.push({ receiverId: element.id, senderId: id, signal: property });
            }
        }
    }

    function parseValidationRules(metadata, element) {

        var name, properties, validator, id,
            path = metadata.binding,
            validationRules = metadata.validationRules || {};

        for (name in validationRules) {

            if (validationRules.hasOwnProperty(name)) {

                validator = fe.validators[name];

                if (validator === undefined) {
                    throw new Error(msg.unknownValidator + name);
                }

                if (typeof validationRules[name] === 'object') {
                    properties = validationRules[name];
                }
                else if (typeof validator.defaultProperty === 'string') {
                    properties = {};
                    properties[validator.defaultProperty] = validationRules[name];
                }

                id = getUniqueId();

                modelMetadata.validationRules.push({
                    id: id, path: path, validatorName: name, validatorProperties: properties
                });

                rules.push({ receiverId: id, senderId: element.id, signal: 'validation-inactive' });
            }
        }
    }

    function getModelMetadata() {
        return modelMetadata;
    }

    function getViewMetadata() {
        return viewMetadata;
    }

    function getRules() {
        return rules;
    }

    function getTriggers() {
        return triggers;
    }

    that.getModelMetadata = getModelMetadata;
    that.getViewMetadata = getViewMetadata;
    that.getRules = getRules;
    that.getTriggers = getTriggers;

    parseMetadata(config.metadata);

    return that;
};
