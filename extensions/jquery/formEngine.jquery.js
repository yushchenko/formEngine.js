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

function jqElement(config) {

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
}

fe.jquery.elements.view = function view(config) {

    var that = jqElement(config);

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

    var that = jqElement(config);

    that.template = template(
        '<div id="<%=containerId%>">' +
            '<label for="<%=editorId%>"><%=properties.label%></label>' +
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

    return that;
};

})((function () { return this; })());
