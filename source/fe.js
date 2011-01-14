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
