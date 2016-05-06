var general = require('../general');

var fs = general.fs;
var path = require('path');

var extend = require('extend');

var renderWidgets = require('./render-widgets');
var renderIndex = require('./render-index');
var renderSingleAll = require('./render-single-all');
var renderCategoryLists = require('./render-category-and-tags-lists');
var renderRss = require('./render-rss');
var respImgs = require('../render-all/responsive-imgs');
var sitemapRenderer = require('./render-sitemap');
var processCategoriesAndTags = require('./before-render/process-categories-and-tags');

module.exports = function (data) {
    return beforeRender(data)
        .then(doRender)
        .then(afterRender);
};

function beforeRender(data) {
    return waitForDataCollectionDone(data)
        .then(processCategoriesAndTags)
        .then(processMenu)
        .then(waitForSeoGeneral)
        .then(renderWidgets)
}

function waitForSeoGeneral(data) {
    return data.seoGeneral.then(function (seoGeneral) {
        data.seoGeneral = seoGeneral;
        return data;
    })
}

function waitForDataCollectionDone(data) {
    return data.renderBlockingPromise
        .then(function (renderBlockingData) {
            return waitAllDeepPromises(renderBlockingData)
                .then(function (additionalData) {
                    return extend(data, additionalData);
                })
        });
}

/**
 * In case if some properties of `data` object are promises,
 * we wait for them to be resolved and then replace promise with
 * actual returned value.
 * @param data
 * @returns {Promise}
 */
function waitAllDeepPromises(data) {
    var promises = [];
    for (var p in data) {
        promises.push(data[p]);
    }
    return new Promise(function (done) {
        Promise.all(promises).then(function (values) {
            var i = 0;
            for (var p in data) {
                data[p] = values[i++];
            }
            done(data);
        })
    });
}

function doRender(data) {
    var renderSingleAllPromise = renderSingleAll(data);
    return Promise.join(
        renderIndex(data),
        renderSingleAllPromise,
        renderRss(data),
        renderCategoryLists(data))
        .then(function () {
            console.log('\nRender pages done. Finilizing...');
            return data;
        })
}

function afterRender(data) {
    return respImgs.saveImgInfo(data)
        .then(function () {
            return respImgs.removeUseless(data)
        })
        .then(function () {
            data.list.forEach(function (post) {
                delete post.categoriesEx;
                delete post.tagsEx;
                delete post.related;
                delete post.images;
            });
            return fs.writeFileAsync(data.settings.path.oldData, JSON.stringify({
                posts: data.list
            }, null, 4));
        })
        .then(function () {
            sitemapRenderer.render(data);
        });
}

function processMenu(data) {
    var pageCatalogue = data.list.map(function (post) {
        var result = {};
        if (post.meta.type === 'page') {
            result[post.meta.slug] = post;
        }
        return result;
    }).reduce(extend);

    data.menu = [];

    data.menuRootOrder.forEach(function (item) {
        if (data.categoryTree[item]) {
            data.menu[item] = data.categoryTree[item];
        } else {
            if (pageCatalogue[item]) {
                var page = pageCatalogue[item];
                data.menu[item] = {
                    'niceName': page.meta.slug,
                    'name': page.meta.title,
                    'url': page.meta.link,
                    'page': true
                };
            } else {
                console.error('Cannot match menu item ' + item);
            }
        }
    });

    function addPostsRefToMenu(item) {
        if (item.children) {
            item.children.forEach(addPostsRefToMenu);
        }
        var key = item.name.toLowerCase();
        var info = data.categoryInfo[key];
        if (info) {
            item.posts = info.posts;
        }
    }

    for (var p in data.menu) {
        addPostsRefToMenu(data.menu[p]);
    }

    return data;
}

