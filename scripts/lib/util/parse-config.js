global.Promise = require('bluebird');

var yaml = require('yamljs'),
    fs = Promise.promisifyAll(require('fs'));

var getParser = function (targetFile) {
    if (/\.json$/i.test(targetFile)) {
        return JSON.parse;
    } else {
        if (/\.yaml$/i.test(targetFile)) {
            return yaml.parse;
        } else {
            throw new Error("Not supported file format for file: " + targetFile);
        }
    }
};

/**
 * @param targetFile json or yaml to parse
 * @returns {Promise|*} promise to JS object
 */
var parseConfig = function (targetFile) {
    var parser = getParser(targetFile);
    return fs.readFileAsync(targetFile).then(parser);
};

module.exports = parseConfig;