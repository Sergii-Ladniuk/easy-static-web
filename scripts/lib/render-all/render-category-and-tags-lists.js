var general = require('../general');

var fs = general.fs;
var jade = require('jade');
var extend = require('extend');
var mkdirp = Promise.promisify(require('mkdirp'));

var path = require('path');

var renderPage = require('./render-page');
var saveContent = require('./save-content');
var renderIndexFunction = require('./render-list-generic');


// FIXME
var pageSize = 10;

module.exports = function (data) {

    var tasks = [];

    data.categories.forEach(function (category) {
        let promise;

        if (category.landing && !category.landing.meta.draft) {
            console.log(category.landing.meta);
            let src = path.join(data.settings.path.public._, category.landing.meta.slug, 'index.html');
            let dest = path.join(data.settings.path.public._, getCategoryPath(category), 'index.html');
            console.log(src);
            console.log(dest);
            promise = fs.copyFileAsync(src, dest)
                .then(_ => fs.unlinkAsync(src));
        } else {
            var f = renderIndexFunction(
                pageSize,
                getCategoryPath(category));
            promise = f(data, category.posts);
        }


        tasks.push(promise);
    });

    data.tags.forEach(function (tag) {
        var f = renderIndexFunction(
            pageSize,
            path.join('tag', tag.slug));
        var promise = f(data, tag.posts);
        tasks.push(promise);
    });

    return Promise.all(tasks);
};


function getCategoryPath(category) {
    return category.path
        ? path.join('category', category.path[0], category.path[1])
        : path.join('category', category.niceName);
}

// tests

if (typeof describe === 'undefined') describe = function () {
};