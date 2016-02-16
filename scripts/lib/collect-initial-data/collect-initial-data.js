var extend = require('extend');
var loadCategoriesTree = require('./load-categories-tree');
var loadTagsInfo = require('./load-tags-info');
var readWrapperConfig = require('./render/read-wrapper-config');
var compileTemplates = require('./render/compile-templates');
var loadRelatedPostsInfo = require('./load-related-tag-texts');
var persistedDataManager = require('./persisted-data-manager');

module.exports = function (settings, db) {
    var data = {
        settings: settings
    };
    var jadeTemplates = compileTemplates(settings);
    return {
        imageInfoPromise: persistedDataManager.loadImageInfo(settings),
        responsiveImgSettings: persistedDataManager.loadResponsiveImgSettings(settings),
        jadeTemplates: jadeTemplates,
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