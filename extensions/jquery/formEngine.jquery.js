/*
 * Default jQuery extension for FormEngine.js
 * http://github.com/yushchenko/formEngine.js
 *
 * Copyright 2010, Valery Yushchenko (http://www.yushchenko.name)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 */

(function( global, undefined ) {

fe.jquery = {};
fe.jquery.elements = {};

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

var msg = {
    undefinedViewContainerId: 'view.initialize: viewContainerId property must be defined for view element.'
};

fe.jquery.element = function jqueryElement(config) {

    var that = fe.element(config),
        editorQuery, containerQuery;

    that.editorId = that.id;
    that.containerId = 'c_' + that.id;

    function initialize() {

        if (that.doInitialize) {
            that.doInitialize();
        }

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

    that.initialize = initialize;
    that.getMarkup = getMarkup;

    that.getEditor = getEditor;
    that.getContainer = getContainer;

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

fe.jquery.elements.textBox = function textBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<input type="text" id="<%=editorId%>"></input>' +
        '</div>'
    );

    that.initialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().val());
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().val(value);
    };

    that.setHidden = function setHidden(hidden) {
        that.getContainer().toggleClass('fe-hidden', hidden);
    };

    return that;
};

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
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<select id="<%=editorId%>"></select>' +
        '</div>'
    );

    that.receiveMessage = function receiveMessage(message) {

        if (message.signal === 'value' && message.rulePath === listPath)  {
            setList(message.data);
            return;
        }

        receiveMessageBase(message);
    };

    that.initialize = function() {
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
        selectedId = value.id;
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

fe.jquery.elements.checkBox = function checkBox(config) {

    var that = fe.jquery.element(config);

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>" class="fe-element-label"><%=properties.label%></label>' +
            '<input type="checkbox" id="<%=editorId%>"></input>' +
        '</div>'
    );

    that.initialize = function() {
        that.getEditor().change(function() {
            that.notifyValueChange(that.getEditor().attr('checked'));
        });
    };

    that.setValue = function setValue(value) {
        that.getEditor().attr('checked', value);
    };

    return that;
};

})((function () { return this; })());
