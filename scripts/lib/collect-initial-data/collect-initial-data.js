var extend = require('extend');
var loadCategoriesTree = require('./load-categories-tree');
var loadTagsInfo = require('./load-tags-info');
var readWrapperConfig = require('./render/read-wrapper-config');
var compileTemplates = require('./render/compile-templates');
var loadRelatedPostsInfo = require('./load-related-tag-texts');

module.exports = function (settings, db) {
    var data = {
        settings: settings
    };

    return {
        renderBlockingPromise: Promise.map(
            [
                loadCategoriesTree, loadTagsInfo,
                readWrapperConfig, compileTemplates,
                loadRelatedPostsInfo
            ],
            function (f) {
                return f(settings);
            }).reduce(extend)
    }
};