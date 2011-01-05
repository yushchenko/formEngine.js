load("build/libs/jslint.js");
load('build/utils.js');

var files = getFileList('lint'),
    i, len = files.length,
    errorCount = 0;

for (i = 0; i < len; i += 1) {
    check(files[i]);
}

java.lang.System.exit(errorCount);

function check(file) {

    print('Checking ' + file + '...');

    JSLINT(readFile(file), { maxerr: 999, evil: true });

    var errors = JSLINT.errors,
        i, len = errors.length, e;

    for (i = 0; i < len; i += 1) {
        e = errors[i];
        print(file + ':' + e.line + ':' + e.character + ' - ' + e.reason);
        print(e.evidence);
    }

    errorCount += len;
}