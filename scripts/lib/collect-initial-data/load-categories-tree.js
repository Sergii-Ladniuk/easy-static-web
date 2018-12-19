var general = require('../general');
var _ = require('lodash');
var fs = general.fs;

module.exports = function (settings, db) {
    return Promise.join(fs.readFileAsync(settings.path.categories, 'utf-8'), fs.readFileAsync(settings.path.menu, 'utf-8'))
        .map(JSON.parse)
        .spread(function (categories, menu) {

            var categoryInfo = {};

            for (var p in categories) {
                var cat = categories[p];
                var catLower = cat.name.toLowerCase();
                if (!categoryInfo[catLower]) {
                    categoryInfo[catLower] = cat;
                    categoryInfo[catLower].url = 'http://localhost:4000/category/' + cat.niceName + '/';
                    function processChildren(parentCategory, parentCategoryLower) {
                        if (parentCategory.children) {
                            var parent = categoryInfo[parentCategoryLower];
                            parentCategory.children.forEach(function (child) {
                                var childLower = child.name.toLowerCase();
                                categoryInfo[childLower] = child;
                                categoryInfo[childLower].url = parent.url + child.niceName + '/';
                                categoryInfo[childLower].path = _.flatMap([
                                    parent.path
                                        ? parent.path
                                        : parent.niceName,
                                    child.niceName]);
                                processChildren(child, childLower);
                            })
                        }
                    }
                    processChildren(cat, catLower);
                }
            }

            return {
                menuRootOrder: menu,
                categoryTree: categories,
                categoryInfo: categoryInfo
            };
        });
};