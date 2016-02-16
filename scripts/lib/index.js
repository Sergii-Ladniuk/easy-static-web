global.Promise = require('bluebird');
var extend = require('extend')
var general = require('./general.js');
exports.module = extend(
    {
        ResponsiveImgs: require('./render-all/responsive-imgs.js')
//        ,
//        processMetadata: require('./generation/process-metadata.js'),
//        generateHtmlAndMore: require('./generation/generate-html-more'),
//        mergePostList: require('./generation/merge-post-list'),
//        renderMenu: require('./generation/render-menu'),
//        renderWidgets: require('./generation/render-widgets')

    },
    general.module
);
