var general = require('../general');

var fs = general.fs;
var path = require('path');

var extend = require('extend');

var renderWidgets = require('./render-widgets');
var renderIndex = require('./render-index');
var renderSingleAll = require('./render-single-all');
var renderCategoryLists = require('./render-category-and-tags-lists');

/**
 * In case if some properties of `data` object are promises,
 * we wait for them to be resolved and then replace promise with
 * actual returned value.
 * @param data
 * @returns {Promise}
 */
function waitAll(data) {
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

module.exports = function (data) {
    return data.renderBlockingPromise
        .then(waitAll)
        .then(function (additionalData) {
            return extend(data, additionalData);
        })
        .then(processCategoriesAndTags)
        .then(processMenu)
        .then(renderWidgets)
        .then(function (data) {
            return Promise.join(renderIndex(data), renderSingleAll(data), renderCategoryLists(data));
        })
};

function processMenu(data) {
    var pageCatalogue = data.list.map(function(post) {
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
                var page =pageCatalogue[item];
                data.menu[item] = {
                    'niceName': page.meta.slug,
                    'name': page.meta.title,
                    'url': page.meta.link,
                    'page': true
                };
            } else {
                console.error('Cannot match menu item '+ item);
            }
        }
    })

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

function processCategoriesAndTags(data) {
    data.categories.forEach(function (cat) {
        const categoryInfo = data.categoryInfo[cat.name];
        categoryInfo.posts = cat.posts;
        extend(cat, categoryInfo);
    });

    var totalPostsTagged = 0;

    data.tags.forEach(function (tag) {
        var info = data.tagInfo[tag.name];
        if (!data.tagInfo[tag.name])
            console.log('fail ' + tag.name)
        // FIXME
        tag.url = 'http://localhost:4000/tag/' + info.slug;
        tag.slug = info.slug;
        tag.postNumber = tag.posts.length;
        totalPostsTagged += tag.postNumber;
        info.posts = tag.posts;
    });

    data.avgPostPerTag = totalPostsTagged / data.tags.length;

    data.tags.sort(function (a, b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });

    processRelatedPosts(data)

    return data;
}

function processRelatedPosts(data) {
    data.list.forEach(function (post) {
        if (post.meta.type === 'post') {
            post.related = [];

            buildRelated(post, data);
            removeRepeatedRelated(post);
            truncateRelated(post, 15);
        }
    });
}

function truncateRelated(post, max) {
    for (var i = 0; i < post.related.length; i++) {
        const length = post.related[i].content.length;
        if (length > max) {
            post.related[i].content.splice(max);
        }
    }
}

function removeRepeatedRelated(post) {
    for (var i = 0; i < post.related.length - 1; i++) {
        var first = post.related[i];
        var second = post.related[i + 1];
        var firstContent = first.content;
        var secondContent = second.content;

        if (firstContent.length > secondContent.length) {
            first.content = arrRemove(firstContent, secondContent);
        } else {
            second.content = arrRemove(secondContent, firstContent);
        }
    }
}

function buildRelated(post, data) {
    var featuredText = data.featuredText;
    [{
        featured: post.meta['featured-category'],
        textData: featuredText.featuredInfoCategories,
        info: data.categoryInfo
    }, {
        featured: post.meta['featured-tag'],
        textData: featuredText.featuredInfoTags,
        info: data.tagInfo
    }].forEach(function (next) {
        if (next.featured) {
            var name = next.featured.toLowerCase();
            var text = next.textData[name];
            if (!text) {
                text = 'Читать больше в рубрике "' + next.info[name].name + '":';
            }

            // make a copy of category's posts
            var content = [].concat(next.info[name].posts);

            // remove the current post
            content.splice(content.indexOf(post), 1);

            if (content.length > 1) {
                post.related.push({
                    text: text,
                    content: content
                });
            }
        }
    })

}


/**
 * @param a
 * @param b
 * @returns c = a - b
 */
function arrRemove(a, b) {
    var c = [];
    a.forEach(function (ea) {
        if (b.indexOf(ea) === -1) {
            c.push(ea);
        }
    })
    logg = 1
    return c;
}

function printPostTitles(arr) {
    return JSON.stringify(arr.map(function (el) {
        return el.meta.title;
    }), null, 2)
}
