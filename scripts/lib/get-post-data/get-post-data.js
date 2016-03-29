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

var cash = require('../cash');
const CASH_KEY = 'get-post-data';
const CHANGED_POSTS = 'CHANGED_POSTS';
const CHANGED_CATEGORIES = 'CHANGED_CATEGORIES';
const CHANGED_TAGS = 'CHANGED_TAGS';

function finilize(data) {
    var common = data.common;

    console.log('posts: ' + common.list.length);
    console.log('tags: ' + common.tags.length);
    console.log('categories: ' + common.categories.length);

    return extend(common, data.basic);
}

function listContent(data) {
    var contentFolder = data.settings.path.content;
    return general.util.listFiles(contentFolder);
}

function loadContent(initialData) {

    return listContent(initialData)
        .filter(function (filePath) {
            return path.extname(filePath) === '.md';
        })
        .map(general.contentLoader || loadContentFromFile)
        .map(function (data) {
            data.common = {};
            data.basic = extend({}, initialData);
            return data;
        });
}

function loadContentFromFile(filePath) {
    return fs.readFileAsync(filePath, "utf-8")
        .then(function (content) {
            return {
                target: {
                    text: content,
                    path: filePath,
                    name: path.basename(filePath)
                }
            }
        })
        .then(function (data) {
            return fs.statAsync(data.target.path)
                .then(function (stat) {
                    data.target.mtime = stat.mtime.getTime();
                    return data;
                });
        })
}

module.exports = function (data) {
    return data.imageInfoPromise
        .then(function (imageInfo) {
            data.imageInfo = imageInfo;
            return data;
        })
        .then(function (data) {
            return data.oldData;
        })
        .then(function (oldData) {
            data.oldData = oldData;
            return data;
        })
        .then(loadContent)
        .then(function (postDataList) {
            var cached = [];
            var toProcess = [];
            var my_cash = cash.get(CASH_KEY);

            if (!my_cash) {
                my_cash = {};
                cash.set(CASH_KEY, my_cash);
            }

            var changedPosts = {},
                changedCategories = {},
                changedTags = {};

            cash.set(CHANGED_POSTS, changedPosts);
            cash.set(CHANGED_CATEGORIES, changedCategories);
            cash.set(CHANGED_TAGS, changedTags);

            postDataList.forEach(function (postData) {
                var id = postData.target.name;
                var cachedData = my_cash[id];
                if (cachedData && cachedData.target.mtime === postData.target.mtime) {
                    cached.push(dataCopy(cachedData));
                } else {
                    toProcess.push(postData);
                }
            });

            console.log("cached:", cached.length, "not cached:", toProcess.length);

            return toProcess
                .map(readMetadata)
                .map(preprocess)
                .map(generateHtmlAndMore)
                .map(function (dataPromise) {
                    dataPromise.then(function (data) {
                        var id = data.target.name;
                        my_cash[id] = dataCopy(data);
                        changedPosts[data.target.meta.slug] = true;

                        data.common.categories.forEach(function(category) {
                            changedCategories[category.name] = true;
                        });
                        data.common.tags.forEach(function(tag) {
                            changedCategories[tag.name] = true;
                        });

                    });
                    return dataPromise;
                })
                .concat(cached);
        })
        .reduce(mergePostList)
        .then(finilize);
};


function dataCopy(data) {
    return {
        common: {
            categories: data.common.categories.map(function (c) {
                return extend({}, c);
            }),
            tags: data.common.tags.map(function (c) {
                return extend({}, c);
            }),
            list: data.common.list.map(function (c) {
                return extend({}, c);
            })
        },
        basic: data.basic,
        target: extend({}, data.target)
    };
}
