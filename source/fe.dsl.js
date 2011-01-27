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