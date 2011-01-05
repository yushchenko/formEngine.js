load('build/utils.js');

var testFiles = getFileList('test');

print('Generating tests.yaml...');
writeFile(
    'tests/tests.yaml',
    template(readFile('tests/tests.yaml.template'), { files: testFiles })
);

print('Generating run-tests.html...');
writeFile(
    'tests/run-tests.html',
    template(readFile('tests/run-tests.html.template'), { files: testFiles })
);
