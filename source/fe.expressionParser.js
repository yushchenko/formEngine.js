fe.expressionParser = function expressionParser(expression) {

    var result = { args: [] },
        toReplace = [],
        argRe = /\:([a-zA-Z_\$][\w\$]*(?:\.?[a-zA-Z_\$][\w\$]*)+)/g,
        matches, i, len,
        source = expression;

    while((matches = argRe.exec(expression)) !== null) {
        toReplace.push(matches[0]); // full expression with column line :customer.firstName
        result.args.push(matches[1]); // data path only
    }

    for (i = 0, len = toReplace.length; i < len; i += 1) {
        source = source.replace(toReplace[i], 'arguments[' + i + ']');
    }

    result.processor = new Function('return ' + source + ';');

    return result;
};