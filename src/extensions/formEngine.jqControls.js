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
            $textBox;

        that.getMarkup = function getMarkup() {
            return textBoxTemplate({id: element.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $textBox = $('#' + element.id);

            $textBox.change(function() {
                that.onValueChanged.trigger($textBox.val());
            });
        };

        that.setValue = function setValue(value) {
            $textBox.val(value);
        };

        return that;
    };

    formEngine.form && formEngine.form.extend({

        textBox: function() {
            return this.element('text', 'textBox');
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
            $ctrl, list, currentValue,
            key = properties.entityListKey || 'id',
            formatter = properties.entityListFormatter || function (i) { return i.name; };

        that.getMarkup = function getMarkup() {
            return comboBoxTemplate({id: element.id, label: properties.label});
        };

        function fillSelect() {

            var node = document.getElementById(element.id),
                option;

            for (var i = 0; i < list.length; i += 1) {

                option = document.createElement('option');

                option.value = list[i][key];
                option.text = formatter(list[i]);

                $.browser.msie ? node.add(option) : node.add(option, null);
            }
        }

        function getByKey(id) {

            for (var i = 0; i < list.length; i += 1) {
                if (list[i][key] === id) {
                    return list[i];
                }
            }
            return {};
        }

        that.initialize = function initialize() {

            //TODO: make data binding fill the list
            that.setList(formEngine.getByPath(engine.model, properties.entityList));

            $ctrl = $('#' + element.id);

            $ctrl.change(function() {
                currentValue = getByKey($ctrl.val());
                that.onValueChanged.trigger(currentValue);
            });
        };

        that.setValue = function setValue(value) {
            $ctrl.val(value[key]);
            currentValue = value;
        };

        that.setList = function setList(newList) {
            list = newList;
            fillSelect();
            currentValue && that.setValue(currentValue); // preserve selected value
        };

        return that;
    };

    formEngine.form && formEngine.form.extend({

        comboBox: function() {
            return this.element('entity', 'comboBox');
        },

        entityList: function(listName) {
            return this.property('entityList', listName);
        },

        entityListKey: function(fieldName) {
            return this.property('entityListKey', fieldName);
        },

        entityListFormatter: function(fieldName) {
            return this.property('entityListFormatter', fieldName);
        }
    });

})(formEngine);