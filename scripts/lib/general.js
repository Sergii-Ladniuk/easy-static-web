global.Promise = require('bluebird');

module.exports = {
    fs: Promise.promisifyAll(require('fs')),
    gm: Promise.promisifyAll(require('gm')),
    parseConfig: require('./util/parse-config'),
    parseConfigAny: require('./util/parse-json-or-yaml'),
    promiseObject: require('./util/promise-object'),
    linkBuilder: require('./util/link-builder'),
    util: require('./util/utils.js')
}