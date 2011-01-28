fe.dsl = {};

fe.dsl.defaultElementProperties = {

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
        if (typeof this.params.validate === 'function') {
            this.params.validate.apply({ element: this.element });
        }
        return this.element;
    }
};

fe.dsl.elementConstructor = function elementConstructor(typeName, params, properties) {

    params = params || {};
    params.defaultProperty = params.defaultProperty || 'binding';
    properties = properties || {};

    function that() {

        var element = { typeName: typeName, properties: {}, validationRules: {}, elements: [] };

        function chain() {

            var i, len = arguments.length, arg;

            for (i = 0; i < len; i += 1) {
                arg = arguments[i];
                if (typeof arg === 'function' && typeof arg.get === 'function') {
                    
                    element.elements.push(arg.get());
                }
                else if (i === 0 && typeof params.defaultProperty === 'string') {
                    element[params.defaultProperty] = arg;
                }
            }

            return chain;
        }

        var context = { element: element, chain: chain, params: params };

        if (typeof params.initialize === 'function') {
            params.initialize.apply(context);
        }

        extend(chain, fe.dsl.defaultElementProperties, context);
        extend(chain, properties, context);

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
