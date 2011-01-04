load('build/utils.js');

var build = readFile('build.xml'),
    lintFileRE = /^\s*<fileset\s+file="([^>]*)"\s*\/>\s*<!--[a-z,]*lint[a-z,]*-->/gm,
    testFileRE = /^\s*<fileset\s+file="([^>]*)"\s*\/>\s*<!--[a-z,]*test[a-z,]*-->/gm,
    lintFiles = [], testFiles = [],
    matches;

print('Generating jslint.files...');

while ((matches = lintFileRE.exec(build))) {
    lintFiles.push(matches[1]);
}

writeFile('build/jslint.files', lintFiles.join('\n'));

print('Generating tests.yaml...');

while ((matches = testFileRE.exec(build))) {
    testFiles.push(matches[1]);
}

writeFile(
    'tests/tests.yaml',
    template(readFile('tests/tests.yaml.template'), { files: testFiles })
);

print('Generating run-tests.html...');

writeFile(
    'tests/run-tests.html',
    template(readFile('tests/run-tests.html.template'), { files: testFiles })
);
