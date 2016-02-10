var parse = require('./parse-config');

function parseJsonOrYaml(targetFile) {

    function parseJson() {
        return parse(targetFile + '.json')
    }

    function parseYaml() {
        return parse(targetFile + '.yaml')
    }

    return parseJson().catch(parseYaml);
}

module.exports = parseJsonOrYaml;