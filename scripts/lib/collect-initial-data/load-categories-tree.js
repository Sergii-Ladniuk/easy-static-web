var general = require('../general');

var fs = general.fs;
var path = require('path');

module.exports = function (settings, db) {
    return Promise.join( fs.readFileAsync(settings.path.categories, 'utf-8'), fs.readFileAsync(settings.path.menu, 'utf-8'))
        .map(JSON.parse)
        .spread(function (categories, menu) {

            var categoryInfo = {};

            for (var p in categories) {
                var cat = categories[p];
                var catLower = cat.name.toLowerCase();
                categoryInfo[catLower] = cat;
                if (cat.children) {
                    cat.children.forEach(function (child) {
                        var childLower = child.name.toLowerCase();
                        categoryInfo[childLower] = child;
                    })
                }
            }

            return {
                menuRootOrder: menu,
                categoryTree: categories,
                categoryInfo: categoryInfo
            };
        });
}