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
var pageSize = 15;

module.exports = function (data) {

    data.categories.forEach(function (category) {
        var f = renderIndexFunction(
            pageSize,
            category.path
                ? path.join('category', category.path[0], category.path[1])
                : path.join('category', category.niceName));
        f(data, category.posts);
    });
    data.tags.forEach(function (tag) {
        var f = renderIndexFunction(
            pageSize,
            path.join('tag', tag.slug));
        f(data, tag.posts);
    });

};


// tests

if (typeof describe === 'undefined') describe = function () {
};