;(function(formEngine, undefined){

    var t = formEngine.template,
        formTemplate = t('<div class="fe-form"><%=content%></div>');

    formEngine.controls.form = function form(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments);

        that.getMarkup = function getMarkup() {
            return formTemplate({content: that.getChildMarkup()});
        };

        that.initialize = function initialize() {
            that.forEachChildControl(function (child) {
                child.initialize();
            });
        };

        return that;
    };

    formEngine.form && formEngine.form.extend({

        label: function(text) {
            return this.property('label', text);
        }
    });


    /* textBox Control
     ***************************************************************************/

    var textBoxTemplate = t(
        '<div class="fe-control">' +
            '<label for="<%=id%>" class="fe-control-label"><%=label%></label>' +
            '<input type="text" id="<%=id%>" class="fe-control-input" />' +
        '</div>'
    );

    formEngine.controls.textBox = function textBox(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments),
            $ctrl;

        that.getMarkup = function getMarkup() {
            return textBoxTemplate({id: element.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $ctrl = $('#' + element.id);

            $ctrl.change(function() {
                that.onValueChanged.trigger($ctrl.val());
            });
        };

        that.setValue = function setValue(value) {
            $ctrl.val(value);
        };

        return that;
    };

    formEngine.form && formEngine.form.extend({

        textBox: function() {
            return this.element('text', 'textBox');
        }
    });

    /* label control
     ***************************************************************************/
    var textLabelTemplate = t(
        '<div class="fe-control">' +
            '<label class="fe-control-label"><%=label%></label>' +
            '<span id="<%=id%>" class="fe-control-span"></span>' +
        '</div>'
    );

    formEngine.controls.textLabel = function textLabel(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments),
            $ctrl;

        that.getMarkup = function getMarkup() {
            return textLabelTemplate({id: element.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $ctrl = $('#' + element.id);
        };

        that.setValue = function setValue(value) {
            $ctrl.text(value);
        };

        return that;
    };

    formEngine.form && formEngine.form.extend({

        textLabel: function() {
            return this.element('text', 'textLabel');
        }
    });

    /* checkBox Control
     ***************************************************************************/

    var checkBoxTemplate = t(
        '<div class="fe-control">' +
            '<label for="<%=id%>" class="fe-control-label"><%=label%></label>' +
            '<input type="checkbox" id="<%=id%>" class="fe-control-checkbox" />' +
        '</div>'
    );

    formEngine.controls.checkBox = function checkBox(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments),
            $ctrl;

        that.getMarkup = function getMarkup() {
            return checkBoxTemplate({id: element.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $ctrl = $('#' + element.id);

            $ctrl.change(function() {
                that.onValueChanged.trigger($ctrl.attr('checked'));
                that.onClick.trigger();
            });
        };

        that.setValue = function setValue(value) {
            $ctrl.attr('checked', value);
        };

        that.onClick = formEngine.event();

        return that;
    };

    formEngine.form && formEngine.form.extend({

        checkBox: function() {
            return this.element('bool', 'checkBox');
        }
    });

    
    /* comboBox Control
     ***************************************************************************/

    var comboBoxTemplate = t(
        '<div class="fe-control">' +
            '<label for="<%=id%>" class="fe-control-label"><%=label%></label>' +
            '<select id="<%=id%>" class="fe-control-input"></select>' +
        '</div>'
    );

    formEngine.controls.comboBox = function comboBox(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments),
            $ctrl, list, selectedItem,
            key = properties.entityListKey || 'id',
            formatter = properties.entityListFormatter || function (i) { return i.name; },
            filter = properties.entityListFilter || function () { return true;};

        that.getMarkup = function getMarkup() {
            return comboBoxTemplate({id: element.id, label: properties.label});
        };

        function fillSelect() {

            var node = document.getElementById(element.id),
                option;

            node.innerHTML = ''; // clean opitons if not empty

            for (var i = 0; i < list.length; i += 1) {

                if (!filter(list[i], engine.model)) {
                    continue;
                }

                option = document.createElement('option');

                option.value = list[i][key];
                option.text = formatter(list[i]);

                $.browser.msie ? node.add(option) : node.add(option, null);
            }
        }

        function getByKey(id) {

            for (var i = 0; i < list.length; i += 1) {
                if (String(list[i][key]) === String(id)) {
                    return list[i];
                }
            }
            return {};
        }

        that.initialize = function initialize() {

            $ctrl = $('#' + element.id);

            $ctrl.change(function() {
                selectedItem = getByKey($ctrl.val());
                that.onValueChanged.trigger(selectedItem);
            });
        };

        that.setValue = function setValue(value) {
            $ctrl.val(value[key]);
            selectedItem = value;
        };

        that.setList = function setList(newList) {
            list = newList;
            fillSelect();
            selectedItem && that.setValue(selectedItem); // preserve selected value
        };

        return that;
    };

    formEngine.form && formEngine.form.extend({

        comboBox: function() {
            return this.element('entity', 'comboBox');
        },

        entityList: function(binding) {
            this.currentElement.bindings.push({binding: binding, method: 'setList'});
            return this.property('entityList', binding);
        },

        entityListKey: function(fieldName) {
            return this.property('entityListKey', fieldName);
        },

        entityListFormatter: function(fn) {
            return this.property('entityListFormatter', fn);
        },

        entityListFilter: function(fn) {
            return this.property('entityListFilter', fn);
        },

        entityListDependsOn: function() { // should be afte entityList

            var val = this.currentElement.controlProperties.entityList;

            for (var i = 0; i < arguments.length; i += 1) {
                this.currentElement.bindings.push({binding: arguments[i], value: val, method: 'setList'});
            }

            return this;
        } 
    });

})(formEngine);