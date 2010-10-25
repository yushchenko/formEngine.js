;(function(formEngine, undefined){

    formEngine.jqControlBase = function jqControlBasee(properties, element, engine) {

        var that = formEngine.controlBase.apply(formEngine, arguments);
        
        that.setHidden = function setHidden(hidden) {
            var $container = $('#' + that.id).parent();
            $container[hidden ? 'addClass' : 'removeClass']('fe-hidden');
        };

        that.setReadonly = function setReadonly(readonly) {
            var $input = $('#' + that.id);
            $input.attr('disabled', readonly);
        };

        return that;
    };


    /* form Control
     ***************************************************************************/

    var t = formEngine.template,
        formTemplate = t('<div class="fe-form"><%=content%></div>');

    formEngine.controls.form = function form(properties, element, engine) {

        var that = formEngine.jqControlBase.apply(formEngine, arguments);

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

        var that = formEngine.jqControlBase.apply(formEngine, arguments),
            $ctrl;

        that.getMarkup = function getMarkup() {
            return textBoxTemplate({id: that.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $ctrl = $('#' + that.id);

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

        var that = formEngine.jqControlBase.apply(formEngine, arguments),
            $ctrl;

        that.getMarkup = function getMarkup() {
            return textLabelTemplate({id: that.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $ctrl = $('#' + that.id);
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

        var that = formEngine.jqControlBase.apply(formEngine, arguments),
            $ctrl;

        that.getMarkup = function getMarkup() {
            return checkBoxTemplate({id: that.id, label: properties.label});
        };

        that.initialize = function initialize() {

            $ctrl = $('#' + that.id);

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

        var that = formEngine.jqControlBase.apply(formEngine, arguments),
            $ctrl, list, filteredList, selectedItemKey,
            key = properties.entityListKey || 'id',

            fmt = properties.entityListFormatter,
            formatter = typeof fmt === 'string' && fmt.slice(0,1) === '%'
                            ? t(fmt.slice(1)) :
                        typeof fmt === 'function'
                            ? fmt : function (i) { return i.name; },

            filter = properties.entityListFilter || function () { return true;};

        that.getMarkup = function getMarkup() {
            return comboBoxTemplate({id: that.id, label: properties.label});
        };

        function fillSelect() {

            var node = document.getElementById(that.id),
                option;

            node.innerHTML = ''; // clean opitons if not empty
            filteredList = [];

            for (var i = 0; i < list.length; i += 1) {

                if (!filter(engine.model, list[i])) {
                    continue;
                }

                filteredList.push(list[i]);

                option = document.createElement('option');

                option.value = list[i][key];
                option.text = formatter(list[i]);

                $.browser.msie ? node.add(option) : node.add(option, null);
            }
        }

        function getByKey(id) {

            for (var i = 0; i < filteredList.length; i += 1) {
                if (String(filteredList[i][key]) === String(id)) {
                    return filteredList[i];
                }
            }
            return undefined;
        }

        that.initialize = function initialize() {

            $ctrl = $('#' + that.id);

            $ctrl.change(function() {
                selectedItemKey = $ctrl.val();
                that.onValueChanged.trigger(getByKey(selectedItemKey));
            });
        };

        that.setValue = function setValue(value) {
            selectedItemKey = value[key];
            $ctrl.val(selectedItemKey);
        };

        that.setList = function setList(newList) {

            list = newList;
            fillSelect();

            var selectedItem = getByKey(selectedItemKey);

            if (selectedItem) { // selected value hasn't changed
                that.setValue(selectedItem); 
            }
            else { // old selected item gone, actually value has changed
                var newSelectedItem = filteredList[0];
                that.setValue(newSelectedItem);
                that.onValueChanged.trigger(newSelectedItem);
            }
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

            // var bindings = formEngine.form.getBindingsFromFunctionSource(fn);

            var arg = this.currentElement.controlProperties.entityList;

            // for (var i = 0; i < bindings.length; i += 1) {
            //     this.currentElement.bindings.push({binding: bindings[i], method: 'setList', argument: arg});
            // }

            formEngine.form.addBindings(this.currentElement, fn, 'setList', undefined, arg);

            return this.property('entityListFilter', fn);
        }

    });

})(formEngine);