var extend = require('extend');
var general = require('../../general');

module.exports = processCategoriesAndTags;

function processCategoriesAndTags(data) {
    data.categories.forEach(function (cat) {
        const categoryInfo = data.categoryInfo[cat.name];
        if (!categoryInfo) {
            throw new Error('Unknown category "' + cat.name + '"\nPlease add it to content/categories.json'
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
        categoryInfo.posts = cat.posts.filter(function (post) {
            return !post.meta.draft;
        });
        categoryInfo.posts.forEach(function (post) {
            post.categoriesEx = post.categoriesEx || [];
            post.categoriesEx.push(categoryInfo);
        });
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
        info.posts = tag.posts = tag.posts.filter(function (post) {
            return !post.meta.draft;
        });
        info.postNumber = getPostNumber(tag.posts);

        info.posts.forEach(function (post) {
            post.tagsEx = post.tagsEx || [];
            post.tagsEx.push(tag);
        })
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
                    if (!next.info[name]) {
                        throw new Error('Unknown tag/category ' + name + ' in post ' + post.meta.slug);
                    }
                    text = 'Читать больше в рубрике "' + next.info[name].name + '":';
                }

                // make a copy of category's posts
                var content = next.info[name].posts.filter(function (post) {
                    return !post.meta.draft;
                });

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

function getPostNumber(posts) {
    return !posts.length ? 0 : posts
        .map(function (post) {
            return post.meta.draft ? 0 : 1;
        })
        .reduce(function (postNumberA, postNumberB) {
            return postNumberA + postNumberB;
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
    });
    return c;
}