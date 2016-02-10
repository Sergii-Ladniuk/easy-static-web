global.Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'))
var jade = require('jade');
var settings;

require('./../settings').load
    .then(function (val) {
        settings = val
        return fs.readFileAsync(settings.path.categories, 'utf-8')
    })
    .then(function (data) {
        var categories = JSON.parse(data)

        categories['o-nas'] = {
            'niceName': 'o-nas',
            'name': 'О нас',
            'url': 'http://localhost:4000/o-nas',
            'postNumber': 1
        }
        categories['faq-chavo'] = {
            'niceName': 'faq-chavo',
            'name': 'FAQ (ЧаВо)',
            'url': 'http://localhost:4000/faq-chavo',
            'postNumber': 1
        }
        categories['kak-podpisatsya'] = {
            'niceName': 'kak-podpisatsya',
            'name': 'Подписаться',
            'url': 'http://localhost:4000/kak-podpisatsya',
            'postNumber': 1
        }

        console.log(categories);

        var categoriesOrdered = ['o-nas', 'europe', 'asia', 'america', 'ukraine', 'about-travel', 'obzory', 'faq-chavo', 'kak-podpisatsya'];
        var menuTemplate = jade.compileFile('views/menu.jade', {filename: menu});
        var menu = menuTemplate({'categories': categories , categoriesOrdered: categoriesOrdered});

        console.log(menu);

        return fs.writeFileAsync(settings.path.menuTemplate, menu)
    })
    .then(function() {
        console.log('done')
    })