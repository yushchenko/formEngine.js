;(function(formEngine, undefined) {

    function form(id) {
        return new form.fn.init(id);
    };

    var nextElementId = 0;
    function getElementId() {
        nextElementId += 1;
        return 'i' + nextElementId;
    }

    function createElement(id, typeName, controlName, container) {

        return {

            id: id || nextElementId(),
            typeName: typeName,
            controlName: controlName,
            container: container,
            controlProperties: {},

            elements: [],
            bindings: [],

            validationRules: []
        };
    }

    function getBindingsFromFunctionSource(fn) {

        var source = fn.toString(),
            argRegExp = /function\s*\(\s*([\w\_\$]+)/,
            argName = argRegExp.exec(source)[1],
            safeArgName = argName.replace(/\$/, '\\$&'), // argument name can contain $
            bindingRegExp = new RegExp(safeArgName + '\\.[\\w\\.\\_\\$]+', 'g'),
            matches = source.match(bindingRegExp),
            results = [];

        for (var i = 0; i < (matches || []).length; i += 1) {
            results.push(matches[i].slice(argName.length + 1));
        }

        return results;
    };

    form.addBindings = function addBindings(element, exp, methodName, propertyName, argument) {

        propertyName && (element[propertyName] = exp);

        if (typeof exp === 'string') { // string
            element.bindings.push({ binding: exp, method: methodName, argument: argument });
        }

        if (typeof exp === 'function') { // function

            var bindings = getBindingsFromFunctionSource(exp);

            for (var i = 0; i < bindings.length; i += 1) {
                element.bindings.push({ binding: bindings[i], method: methodName, argument: argument || exp });
            }
        }
    };

    form.fn = form.prototype = {

        metadata: undefined,
        currentElement: undefined,

        init: function(id) { // form constructor

            this.metadata = this.currentElement = createElement(id || nextElementId(), 'form', 'form');

            return this;
        },

        end: function() { // move up to one level or return form metadata

            if (this.metadata === this.currentElement) {
                return this.metadata;
            }

            this.currentElement = this.currentElement.container;

            return this;
        },

        element: function(typeName, controlName) { // add new element

            var e = createElement(getElementId(), typeName, controlName, this.currentElement);
            
            this.currentElement.elements.push(e);
            this.currentElement = e;

            return this;
        },

        id: function(id) {      //TODO: add check if id's unique
            this.currentElement.id = id;
            return this;
        },

        property: function(name, value) {
            this.currentElement.controlProperties[name] = value;
            return this;
        },

        value: function(exp) {
            form.addBindings(this.currentElement, exp, 'setValue', 'valueExp');
            return this;
        },

        hidden: function(exp) {
            form.addBindings(this.currentElement, exp, 'setHidden', 'hiddenExp');
            return this;
        },

        readonly: function(exp) {
            form.addBindings(this.currentElement, exp, 'setReadonly', 'readonlyExp');
            return this;
        },
        
        //TODO: add method to determine type's default control

        text: function(controlName) {
            return this.element('text', controlName || 'textBox');
        },

        bool: function(controlName) {
            return this.element('bool', controlName || 'checkBox');
        },

        number: function(controlName) {
            return this.element('number', controlName || 'textBox');
        },

        date: function(controlName) {
            return this.element('date', controlName || 'textBox');
        }
    };

    form.fn.init.prototype = form.fn;

    // simple way to extend DSL with own functions
    form.extend = function(obj) {

        for (var name in obj) {

            if (!obj.hasOwnProperty(name) || typeof obj[name] !== 'function') {
                continue;
            }

            form.fn[name] = obj[name];
        }
    };

    formEngine.form = form;

})(formEngine);