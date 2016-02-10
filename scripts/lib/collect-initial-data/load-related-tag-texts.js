var general = require('../general');

var fs = general.fs;
var path = require('path');

module.exports = function (settings, db) {
    return fs.readFileAsync(settings.path.featuredText, 'utf-8')
        .then(JSON.parse)
        .then(function(data) {
            [data.featuredInfoCategories, data.featuredInfoTags].forEach(function(arr) {
                for (var p in arr) {
                    var next = arr[p];
                    delete arr[p];
                    arr[p.toLowerCase().replace(/ +/g,'-')] = next;
                }
            });
            return {
                featuredText: data
            };
        });
};