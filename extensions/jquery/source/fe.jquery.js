
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