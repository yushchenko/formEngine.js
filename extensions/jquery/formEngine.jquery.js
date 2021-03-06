/*
 * Default jQuery extension for FormEngine.js 0.2

 * http://github.com/yushchenko/formEngine.js
 *
 * Copyright 2010, Valery Yushchenko (http://www.yushchenko.name)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * Sun Feb 6 11:44:26 2011 +0200
 * 
 */

(function( global, undefined ) {

fe.jquery = {
    elements: {},
    dsl: {}
};

function template(str, data) { // Stolen from Underscore.js ;)

    var escapeRegExp = function(s) { return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1'); },
        c  = { start: '<%', end: '%>', interpolate : /<%=(.+?)%>/g },
        endMatch = new RegExp("'(?=[^"+c.end.substr(0, 1)+"]*"+escapeRegExp(c.end)+")","g"),
        fn = new Function('obj',
                          'var p=[],print=function(){p.push.apply(p,arguments);};' +
                          'with(obj||{}){p.push(\'' +
                          str.replace(/\r/g, '\\r')
                          .replace(/\n/g, '\\n')
                          .replace(/\t/g, '\\t')
                          .replace(endMatch,"✄")
                          .split("'").join("\\'")
                          .split("✄").join("'")
                          .replace(c.interpolate, "',$1,'")
                          .split(c.start).join("');")
                          .split(c.end).join("p.push('") + "');}return p.join('');");

    return data ? fn(data) : fn;
}

function runSimpleApp(config) {

    var app = {};

    app.provider = fe.metadataProvider({ metadata: config.metadata });
    app.engine = fe.engine();
    app.model = fe.model({
                             metadata: app.provider.getModelMetadata(),
                             engine: app.engine,
                             trackChanges: config.trackChanges || false
                         });
    app.view = fe.view({
                           metadata: app.provider.getViewMetadata(),
                           elementTypes: fe.jquery.elements,
                           defaultElementType: fe.jquery.element,
                           engine: app.engine
                       });

    app.engine.addRules(app.provider.getRules());
    app.engine.addTriggers(app.provider.getTriggers());

    app.view.initialize();

    app.model.set(config.data);

    return app;
}

var msg = {
    undefinedViewContainerId: 'view.initialize: viewContainerId property must be defined for view element.'
};

fe.jquery.runSimpleApp = runSimpleApp;

fe.jquery.element = function jqueryElement(config) {

    var that = fe.element(config),
        setHiddenBase = that.setHidden,
        setReadonlyBase = that.setReadonly,
        editorQuery, containerQuery, errorQuery;

    that.editorId = that.id.replace(/\./g, '_');
    that.containerId = 'c_' + that.editorId;
    that.errorId = 'e_' + that.editorId;

    function initialize() {

        if (that.doInitialize) {
            that.doInitialize();
        }

        that.notifyRequiredStatusChange();

        that.eachChild(function(child) {
            child.initialize();
        });
    }

    function getMarkup() {

        var tmpl  = that.template,
            content = '';

        that.eachChild(function(child) {
            content += child.getMarkup();
        });

        if (typeof tmpl === 'function') {
            return tmpl({
                editorId: that.editorId,
                containerId: that.containerId,
                errorId: that.errorId,
                content: content,
                properties: that.properties
            });
        }

        return content;
    }

    function getEditor() {
        if (editorQuery === undefined) {
            editorQuery = $('#' + that.editorId);
        }
        return editorQuery;
    }

    function getContainer() {
        if (containerQuery === undefined) {
            containerQuery = $('#' + that.containerId);
        }
        return containerQuery;
    }

    function getError() {
        if (errorQuery === undefined) {
            errorQuery = $('#' + that.errorId);
        }
        return errorQuery;
    }

    function setHidden(hidden) {

        var container = that.getContainer();
        if (container) {
            container.toggleClass('fe-hidden', hidden);
        }

        setHiddenBase(hidden);
    }

    function setReadonly(readonly) {

        var editor = that.getEditor();
        if (editor) {
            editor.get(0).disabled = readonly;
        }

        setReadonlyBase(readonly);
    }

    function showErrors(errors) {
        var error = that.getError();
        if(error) {
            error.html(errors.join('<br />'));
        }
    }

    function setStatus(status) {
        var container = that.getContainer();
        if (container) {
            container.toggleClass('fe-changed', status === 'changed')
                     .toggleClass('fe-saved', status === 'saved');
        }
    }

    function markRequired(required) {
        var container = that.getContainer();
        if (container) {
            container.toggleClass('fe-required', required);
        }
        
    }

    that.initialize = initialize;
    that.getMarkup = getMarkup;

    that.getEditor = getEditor;
    that.getContainer = getContainer;
    that.getError = getError;

    that.setHidden = setHidden;
    that.setReadonly = setReadonly;
    that.showErrors = showErrors;
    that.setStatus = setStatus;
    that.markRequired = markRequired;

    return that;
};

fe.jquery.elements.view = function view(config) {

    var that = fe.jquery.element(config);

    that.template = template('<div id="<%=containerId%>"><%=content%></div>');

    that.doInitialize = function doInitialize() {

        var viewContainerId = that.properties.viewContainerId;

        if (typeof viewContainerId !== 'string') {
            throw new Error(msg.undefinedViewContainerId);
        }

        document.getElementById(viewContainerId).innerHTML = that.getMarkup();
    };

    return that;
};

fe.jquery.dsl.view = fe.dsl.elementConstructor('view', {}, {
    container: function(containerId) {
        this.element.properties.viewContainerId = containerId;
        return this.chain;
    }
});

fe.jquery.elements.textBox = function textBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="text" id="<%=editorId%>" class="fe-editor-wide"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().val());
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().val(value);
    };

    return that;
};

fe.jquery.dsl.textBox = fe.dsl.elementConstructor('textBox');

fe.jquery.elements.comboBox = function comboBox(config) {

    var that = fe.jquery.element(config),
        engine = config.engine,
        receiveMessageBase = that.receiveMessage,
        listPath = that.properties.list,
        currentList,
        selectedId;

    //TODO: consider moving this to metadataProvider (special properties exposed by control?)
    if (listPath) {
        engine.addRule({ receiverId: that.id, path: listPath, signal: 'value' });
    }

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<select id="<%=editorId%>" class="fe-editor-wide"></select>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.receiveMessage = function receiveMessage(message) {

        if (message.signal === 'value' && message.rulePath === listPath)  {
            setList(message.data);
            return;
        }

        receiveMessageBase(message);
    };

    that.doInitialize = function() {
        that.getEditor().change(function() {
            var item = getItemById(that.getEditor().val());
            that.notifyValueChange(item);
        });
    };

    function setList(list) {

        var i, len,
            select = document.getElementById(that.editorId);

        currentList = list;

        select.innerHTML = ''; // cleaning previous list of options

        function addOption(item) {

            var option = document.createElement('option');
            option.value = item.id;
            option.text = item.name;

            select.add(option, null);
        }

        addOption({ id: -1, name: 'Select...' });

        for (i = 0, len = list.length; i < len; i += 1) {
            addOption(list[i]);
        }

        selectItem(); // restoring selected item
    }

    that.setValue = function setValue(value) {
        selectedId = (value !== null && value !== undefined) ? value.id : -1;
        selectItem();
    };

    function selectItem(id) {
        that.getEditor().val(id || selectedId || -1);
    }

    function getItemById(id) {

        var i, len;

        id = parseInt(id, 10);

        if (currentList) {
            for (i = 0, len = currentList.length; i < len; i += 1) {
                if (currentList[i].id === id) {
                    return currentList[i];
                }
            }
        }

        return undefined;
    }

    return that;
};

fe.jquery.dsl.comboBox = fe.dsl.elementConstructor('comboBox',
    {
        validate: function() {
            if(typeof this.element.properties.list !== 'string') {
                throw new Error('comboBox (' + this.element.binding + ') must have list property!');
            }
        }
    },
    {
        list: function(list) {
            this.element.properties.list = list;
            return this.chain;
        }
    }
);

fe.jquery.elements.checkBox = function checkBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="checkbox" id="<%=editorId%>"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().attr('checked'));
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().attr('checked', value);
    };

    return that;
};

fe.jquery.dsl.checkBox = fe.dsl.elementConstructor('checkBox');

fe.jquery.elements.toolBar = function toolBar(config) {

    var that = fe.jquery.element(config);

    that.template = template('<div id="<%=containerId%>" class="fe-element fe-toolbar"><%=content%></div>');

    return that;
};

fe.jquery.dsl.toolBar = fe.dsl.elementConstructor('toolBar');

fe.jquery.elements.button = function button(config) {

    var that = fe.jquery.element(config),
        engine = config.engine;

    that.template = template('<span id="<%=editorId%>"><%=properties.label%></span>');

    that.doInitialize = function() {
        that.getEditor()
            .button({ icons: { primary: that.properties.icon } })
            .click(function() {
                engine.sendMessage({ senderId: that.id, signal: 'click' });
            });
    };

    that.setHidden = function setHidden(hidden) {
        that.getEditor().toggleClass('fe-hidden', hidden);
    };

    that.setReadonly = function setReadonly(readonly) {
        that.getEditor().button(readonly ? 'disable' : 'enable');
    };

    return that;
};

fe.jquery.dsl.button = fe.dsl.elementConstructor('button', { defaultProperty: 'id' }, {
    icon: function(icon) {
        this.element.properties.icon = icon;
        return this.chain;
    }
});

fe.jquery.elements.label = function label(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark"></span>' +
            '<span id="<%=editorId%>" class="fe-editor-wide"></span>' +
        '</div>'
    );

    that.setValue = function setValue(value) {
        that.getEditor().text(value);
    };

    return that;
};

fe.jquery.dsl.label = fe.dsl.elementConstructor('label');

fe.jquery.elements.panel = function panel(config) {

    var that = fe.jquery.element(config);

    that.template = template('<div id="<%=containerId%>" class="fe-element fe-panel"><%=content%></div>');

    return that;
};

fe.jquery.dsl.panel = fe.dsl.elementConstructor('panel');

fe.jquery.elements.header = function header(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element fe-header">' +
            '<span id="<%=editorId%>"></span>' +
        '</div>'
    );

    that.setValue = function setValue(value) {
        that.getEditor().text(value);
    };

    return that;
};

fe.jquery.dsl.header = fe.dsl.elementConstructor('header');

fe.jquery.elements.datePicker = function datePicker(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="text" id="<%=editorId%>" class="fe-editor-narrow"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {

        var e = that.getEditor().datepicker();

        e.change(function() {
            that.notifyValueChange(e.datepicker('getDate'));
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().datepicker('setDate', value);
    };

    return that;
};

fe.jquery.dsl.datePicker = fe.dsl.elementConstructor('datePicker');

fe.jquery.elements.numberEditor = function numberEditor(config) {

    var that = fe.jquery.element(config),
        currentValue;

    that.template = template(
        '<div id="<%=containerId%>" class="fe-element">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<span class="fe-element-required-mark">*</span>' +
            '<input type="text" id="<%=editorId%>" class="fe-editor-narrow"></input>' +
            '<div id="<%=errorId%>" class="fe-element-error"></div>' +
        '</div>'
    );

    that.doInitialize = function() {

        var e = that.getEditor();

        e.change(function() {

            var newValue = +e.val();

            if (!isNaN(newValue)) {
                that.notifyValueChange(newValue);
                currentValue = newValue;
            }
            else {
                that.setValue(currentValue);
            }
        });
    };

    that.setValue = function setValue(value) {
        currentValue = value;
        that.getEditor().val(value);
    };

    return that;
};

fe.jquery.dsl.numberEditor = fe.dsl.elementConstructor('numberEditor');

})((function () { return this; })());
