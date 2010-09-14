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

            validationRules: []
        };
    }

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

        property: function(name, value) {
            this.currentElement.controlProperties[name] = value;
            return this;
        },

        label: function(text) {
            this.property('label', text);
            return this;
        },

        value: function(valueExp) {
            this.currentElement.valueExp = valueExp;
            return this;
        },

        text: function(typeName) {
            return this.element('text', typeName || 'textBox');
        },

        textBox: function() {
            this.currentElement.controlName = 'textBox';
            return this;
        }
    };

    form.fn.init.prototype = form.fn;

    formEngine.form = form;

})(formEngine);