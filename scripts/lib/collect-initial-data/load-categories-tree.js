var general = require('../general');

var fs = general.fs;
var path = require('path');

module.exports = function (settings, db) {
    return Promise.join(fs.readFileAsync(settings.path.categories, 'utf-8'), fs.readFileAsync(settings.path.menu, 'utf-8'))
        .map(JSON.parse)
        .spread(function (categories, menu) {

            var categoryInfo = {};

            for (var p in categories) {
                var cat = categories[p];
                var catLower = cat.name.toLowerCase();
                categoryInfo[catLower] = cat;
                categoryInfo[catLower].url = 'http://localhost:4000/category/' + cat.niceName + '/';
                if (cat.children) {
                    var parent = categoryInfo[catLower];
                    cat.children.forEach(function (child) {
                        var childLower = child.name.toLowerCase();
                        categoryInfo[childLower] = child;
                        categoryInfo[childLower].url = parent.url + child.niceName + '/';
                        categoryInfo[childLower].path = [parent.niceName, child.niceName];
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