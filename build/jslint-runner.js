load("build/libs/jslint.js");

 check('source/fe.js')
.check('tests/source/fe.tests.js')
.report();



function check(file) {

    JSLINT(readFile(file), { maxerr: 999 });

    var errors = JSLINT.errors,
        i, len = errors.length, e;

    for (i = 0; i < len; i += 1) {
        e = errors[i];
        print(file + ':' + e.line + ':' + e.character + ' - ' + e.reason);
        print(e.evidence);
    }

    check.count = (check.count || 0) + len;

    return {
        check: check,
        report: function() {
            java.lang.System.exit(check.count);
        }
    };
}