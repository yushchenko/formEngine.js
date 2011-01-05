load('build/utils.js');

var testFiles = getFileList('test');

print('Generating tests.yaml...');
writeFile(
    'tests/tests.yaml',
    template(readFile('tests/tests.yaml.template'), { files: testFiles })
);

print('Generating tests.html...');
writeFile(
    'tests/tests.html',
    template(readFile('tests/tests.html.template'), { files: testFiles })
);