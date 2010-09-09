;(function(formEngine, undefined) {


    formEngine.event = function event() {

        var that = {};

        function bind(handler) {
            
        }

        function trigger() {
            
        }

        that.bind = bind;
        that.trigger = trigger;

        return that;
    };
      

    // -------------------------------------------------------------------------
    // The following template code is taken from Underscore.js (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
    // This code destibuted under MIT licence

    // Quick regexp-escaping function, because JS doesn't have RegExp.escape().
    var escapeRegExp = function(s) { return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1'); };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    formEngine.templateSettings = {
        start       : '<%',
        end         : '%>',
        interpolate : /<%=(.+?)%>/g
    };

    // JavaScript templating a-la ERB, pilfered from John Resig's
    // "Secrets of the JavaScript Ninja", page 83.
    // Single-quote fix from Rick Strahl's version.
    // With alterations for arbitrary delimiters, and to preserve whitespace.
    formEngine.template = function(str, data) {
        var c  = formEngine.templateSettings;
        var endMatch = new RegExp("'(?=[^"+c.end.substr(0, 1)+"]*"+escapeRegExp(c.end)+")","g");
        var fn = new Function('obj',
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
                              .split(c.end).join("p.push('")
                              + "');}return p.join('');");
        return data ? fn(data) : fn;
    };

    // End of Underscore.js code -----------------------------------------------

})(formEngine);
