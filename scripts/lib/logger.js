const fs = require('fs');
const path = require('path');
const util = require('util');

const settings = require('../settings').loadSync();
const logPath = path.join(settings.path.blog, 'errors.log');
const _ = require('lodash');


exports.log = (msg) => {
    const params = _.slice(arguments, 1);
    const info = util.format(msg, params);

    console.log(info);

    fs.appendFile(logPath, info)
};
