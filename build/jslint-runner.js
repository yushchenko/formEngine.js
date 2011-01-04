load("build/libs/jslint.js");

 check('source/fe.js')
.check('source/fe.engine.js')
.check('source/fe.model.js')
.check('source/fe.view.js')
.check('source/fe.element.js')
.check('source/fe.metadataProvider.js')

.check('tests/source/fe.tests.js')
.check('tests/source/fe.engine.tests.js')
.check('tests/source/fe.model.tests.js')
.check('tests/source/fe.view.tests.js')
.check('tests/source/fe.element.tests.js')
.check('tests/source/fe.metadataProvider.tests.js')
.check('tests/source/formEngine.tests.js')

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