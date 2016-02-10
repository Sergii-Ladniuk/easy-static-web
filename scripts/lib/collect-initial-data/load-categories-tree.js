var general = require('../general');

var fs = general.fs;
var path = require('path');

module.exports = function (settings, db) {
    return fs.readFileAsync(settings.path.categories, 'utf-8')
        .then(function (data) {
            var categories = JSON.parse(data);

            var categoryInfo = {};
            var categoryInfoFlat = {};

            for (var p in categories) {
                var cat = categories[p];
                var catLower = cat.name.toLowerCase();
                categoryInfo[catLower] = cat;
                if (cat.children) {
                    cat.children.forEach(function (child) {
                        var childLower = child.name.toLowerCase();
                        categoryInfo[childLower] = child;
                        categoryInfo[childLower].name = child.name;
                    })
                }
            }

            // FIXME
            categoryInfo['о нас'] = categories['o-nas'] = {
                'niceName': 'o-nas',
                'name': 'О нас',
                'url': 'http://localhost:4000/o-nas',
                'postNumber': 1
            }
            categoryInfo['faq (чаво)'] = categories['faq-chavo'] = {
                'niceName': 'faq-chavo',
                'name': 'FAQ (ЧаВо)',
                'url': 'http://localhost:4000/faq-chavo',
                'postNumber': 1
            }
            categoryInfo['подписаться'] = categories['kak-podpisatsya'] = {
                'niceName': 'kak-podpisatsya',
                'name': 'Подписаться',
                'url': 'http://localhost:4000/kak-podpisatsya',
                'postNumber': 1
            }

            var categoriesOrdered =
                ['o-nas', 'europe', 'asia', 'america', 'ukraine',
                    'about-travel', 'obzory', 'faq-chavo', 'kak-podpisatsya'];

            return {
                menuRootOrder: categoriesOrdered,
                menu: categories,
                categoryInfo: categoryInfo,
                categoryInfoFlat: categoryInfoFlat
            };
        });
}