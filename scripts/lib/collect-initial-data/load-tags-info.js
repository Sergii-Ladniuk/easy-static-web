var general = require('../general');

var fs = general.fs;
var path = require('path');

module.exports = function (settings, db) {
    return fs.readFileAsync(settings.path.tags, 'utf-8')
        .then(JSON.parse)
        .then(function(data) {
            var toLower = {};
            // put keys to lower case
            for (var p in data) {
                var pl = p.toLowerCase().replace(/ +/g, '-');
                toLower[pl] = data[p];
                toLower[pl].prettyName = p;
            }
            return {
                tagInfo: toLower
            };
        });
};