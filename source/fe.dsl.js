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
        this.element.properties.label = label;
        return this.chain;
    },

    binding: function(binding) {
        this.element.binding = binding;
        return this.chain;
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

        if (typeof init === 'function') { // constructor
            init(element);
        }
        else if ( typeof init === 'string') { // only type name
            element.typeName = init;
        }

        function chain() {

            var i, len = arguments.length, arg;

            for (i = 0; i < len; i += 1) {
                arg = arguments[i];
                if (typeof arg === 'function' && typeof arg.get === 'function') {
                    element.elements.push(arg.get());
                }
                else if (i === 0 && typeof arg === 'string') {
                    element.binding = arg;
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