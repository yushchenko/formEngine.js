load('build/utils.js');

var build = readFile('build.xml'),
    lintFileRE = /^\s*<fileset\s+file="([^>]*)"\s*\/>\s*<!--[a-z,]*lint[a-z,]*-->/gm,
    lintFiles = [],
    matches;

print('Generating JSLint file list...');

while ((matches = lintFileRE.exec(build))) {
    lintFiles.push(matches[1]);
}

writeFile('build/jslint.files', lintFiles.join('\n'));