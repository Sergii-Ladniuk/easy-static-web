var general = require('../general');

var fs = general.fs;
var path = require('path');
var util = require('util');
var extend = require('extend');
var findit = require('findit');

var readMetadata = require('./process-metadata');
var generateHtmlAndMore = require('./generate-html-more');
var mergePostList = require('./merge-post-list');
var preprocess = require('./preprocess');

function finilize(data) {
    var common = data.common;

    // TODO : remove logging
    console.log('posts: '+common.list.length)
    console.log('tags: '+common.tags.length)
    console.log('categories: '+common.categories.length)

    return extend(common, data.basic);
}

function listFiles(dir) {
    return new Promise(function (fulfil) {

        var postFinder = findit(dir);
        var files = [];

        postFinder.on('file', function (filePath) {
            files.push(filePath);
        });

        postFinder.on('end', function () {
            fulfil(files);
        })
    })
}

function listContent(data) {
    var contentFolder = data.settings.path.content;
    return listFiles(contentFolder);
}

function loadContent(data) {

    return listContent(data)
        .filter(function (filePath) {
            return path.extname(filePath) === '.md';
        })
        .map(function (filePath) {
            return new Promise(function (fulfil) {
                fs.readFileAsync(filePath, "utf-8").then(function (content) {
                    fulfil({
                        target: {
                            text: content
                        },
                        common: {},
                        basic: extend({path: filePath}, data)
                    })
                })
            })
        });
}


module.exports = function (data) {
    return loadContent(data)
        .map(readMetadata)
        .map(preprocess)
        .map(generateHtmlAndMore)
        .reduce(mergePostList)
        .then(finilize);
};