'use strict';
var general = require('../general');

var fs = general.fs;
var extend = require('extend');
var loadCategoriesTree = require('./load-categories-tree');
var loadTagsInfo = require('./load-tags-info');
var readWrapperConfig = require('./render/read-wrapper-config');
var compileTemplates = require('./render/compile-templates');
var loadRelatedPostsInfo = require('./load-related-tag-texts');
var persistedDataManager = require('./persisted-data-manager');

module.exports = function (settings, db) {
    var jadeTemplates = compileTemplates(settings);
    return {
        imageInfoPromise: persistedDataManager.loadImageInfo(settings),
        responsiveImgSettings: persistedDataManager.loadResponsiveImgSettings(settings),
        jadeTemplates: jadeTemplates,
        seoGeneral: fs.readFileAsync(settings.path.content_seo_general, 'utf-8').then(function(seo) {
            return JSON.parse(seo);
        }),
        oldData: fs.readFileAsync(settings.path.oldData, 'utf-8').then(function (oldData) {
            var result = !oldData
                ? {} :
                JSON.parse(oldData).posts.map(function(post) {
                    var entry = {};
                    entry [post.path] = post;
                    return entry;
                }).reduce(extend);
            return result;
        }).catch(function () {
            return {};
        }),
        renderBlockingPromise: Promise.map(
            [
                loadCategoriesTree, loadTagsInfo,
                readWrapperConfig, jadeTemplates,
                loadRelatedPostsInfo
            ],
            function (f) {
                if (typeof f !== 'function') {
                    return f;
                } else {
                    return f(settings);
                }
            }).reduce(extend)
    }
};