
// writeFile() from "Spicing Up Embedded JavaScript" by John Resig

importPackage(java.io);

function writeFile( file, stream ) {
    var buffer = new PrintWriter( new FileWriter( file ) );
    buffer.print( stream );
    buffer.close();
}

// Micro templates form Underscore.js

var escapeRegExp = function(s) { return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1'); };
        
// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
var templateSettings = {
    start       : '<%',
    end         : '%>',
    interpolate : /<%=(.+?)%>/g
};

// JavaScript templating a-la ERB, pilfered from John Resig's
// "Secrets of the JavaScript Ninja", page 83.
// Single-quote fix from Rick Strahl's version.
// With alterations for arbitrary delimiters, and to preserve whitespace.
function template(str, data) {
    var c  = templateSettings;
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


function getFileList(tag) { // extracts file list from build.xml

    var re = new RegExp('^\\s*<fileset\\s+file="([^>]*)"\\s*\\/>\\s*<!--[a-z,]*' + tag + '[a-z,]*-->', 'gm'),
        files = [], matches;

    if(!getFileList.buildFile) {
        getFileList.buildFile = readFile('build.xml');
    }

    while ((matches = re.exec(getFileList.buildFile))) {
        files.push(matches[1]);
    }

    return files;
}