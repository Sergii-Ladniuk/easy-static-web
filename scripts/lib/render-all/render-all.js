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
    return new Promise(function (renderAllDone) {
        data.renderBlockingPromise
            .then(waitAll)
            .then(function (additionalData) {
                return extend(data, additionalData);
            })
            .then(processCategoriesAndTags)
            .then(processMenu)
            .then(renderWidgets)
            .then(function (data) {
                //require('fs').writeFileSync('/Users/sergii/dev/blog/_data.json', JSON.stringify(
                //    data.list.map(function (post) {
                //        var post = extend({}, post);
                //        delete post.related;
                //        return post;
                //    }),
                //    null, 4));
                var renderSingleAllPromise = renderSingleAll(data);
                Promise.join(
                    renderIndex(data),
                    renderSingleAllPromise,
                    renderRss(data),
                    renderCategoryLists(data))
                    .then(function () {
                        console.log('saveImgInfo')
                        respImgs.saveImgInfo(data)
                    })
                    .then(function () {
                        return respImgs.removeUseless(data)
                    })
                    .then(function () {
                        data.list.forEach(function (post) {
                            delete post.related;
                        })
                        return fs.writeFileAsync(data.settings.path.oldData, JSON.stringify({
                            posts: data.list
                        }, null, 4));
                    })
                    .then(function () {
                        sitemapRenderer.render(data);
                    })
                    .then(renderAllDone);
            });
    });
};

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

function getPostNumber(posts) {
    return !posts.length ? 0 : posts
        .map(function (post) {
            return post.draft ? 0 : 1;
        })
        .reduce(function (postNumberA, postNumberB) {
            return postNumberA + postNumberB;
        })
}

function processCategoriesAndTags(data) {
    data.categories.forEach(function (cat) {
        const categoryInfo = data.categoryInfo[cat.name];
        if (!categoryInfo) {
            throw new Error('Unknown category "' + cat.name + "\nPlease add it to content/categories.json"
                + "\nThe entry is supposed to be: \n" + "\n\n"
                + JSON.stringify(
                    {
                        "niceName": general.util.slugifyTranslit(cat.name),
                        "name": cat.name
                    },
                    null, 4)
                + "\nJust place it in the right as subcategory or root category.\n\n"
            )
        }
        categoryInfo.posts = cat.posts;
        categoryInfo.postNumber = getPostNumber(categoryInfo.posts);
        extend(cat, categoryInfo);
    });

    var totalPostsTagged = 0;

    data.tags.forEach(function (tag) {
        var info = data.tagInfo[tag.name];

        if (!info) {
            info = data.tagInfo[tag.name] = {
                slug: general.util.slugifyTranslit(tag.name)
            };
            var wrapper = {};
            wrapper[tag.name] = info;
            console.warn('New tag found : \n' + JSON.stringify(wrapper, null, 4));
            console.warn('It is better to add it to content/tags.json');
            data.saveTagInfo = true;
        }

        if (!data.tagInfo[tag.name])
            console.log('fail ' + tag.name)
        // FIXME
        tag.url = 'http://localhost:4000/tag/' + info.slug;
        tag.slug = info.slug;
        tag.postNumber = tag.posts.length;
        totalPostsTagged += tag.postNumber;
        info.posts = tag.posts;
        info.postNumber = getPostNumber(tag.posts);
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
            truncateRelated(post, data.settings.generate['related-posts-max-length']);
        }
    });
}

function truncateRelated(post, max) {
    for (var i = 0; i < post.related.length; i++) {
        var content = post.related[i].content;
        if (content.length > max) {
            content.splice(max);
        }
    }
}

function removeRepeatedRelated(post) {
    function cut(arr) {
        arr.sort(function (a, b) {
            return b.content.length - a.content.length;
        });
        var removeFrom = arr.splice(0, 1)[0];
        if (arr.length) {
            arr.forEach(function (removeMe) {
                removeFrom.content = arrRemove(removeFrom.content, removeMe.content);
            });
            cut(arr);
        }
    }

    cut([].concat(post.related));
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
            next.featured.forEach(function (name) {
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
            });
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
