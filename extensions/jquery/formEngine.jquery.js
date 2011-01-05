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

function jqElement(config) {

    var that = fe.element(config);

    that.initialize = function initialize() {
        
    };

    return that;
}

fe.jquery.elements.view = function view(config) {

    var that = jqElement(config);

    return that;
};

fe.jquery.elements.textBox = function textBox(config) {

    var that = jqElement(config);

    return that;
};

})((function () { return this; })());
