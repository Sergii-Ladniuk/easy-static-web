var fs = require('fs'),
    xml2js = require('xml2js');

global.Promise = require('bluebird');
var parser = Promise.promisifyAll(new xml2js.Parser());
var settings;
var tasks = [];
require('./../settings.js').load
    .then(function (val) {
        settings = val;
        return new Promise(function (resolve) {
            resolve(settings)
        });
    })
    .then(function () {
        return new Promise(function (resolve) {
            fs.readFileAsync(settings.path.wpJson)
                .then(function (data) {
                    // cashed json exists and read
                    resolve(JSON.parse(data))
                }).catch(function (err) {
                    // no cashed json => parse XML
                    fs.readFileAsync(settings.path.blog + '/marinatravelblogcom.wordpress.2016-01-21.xml')
                        .then(parser.parseStringAsync)
                        .then(function (result) {
                            result.channel['item'].forEach(function (item) {
                                item['content:encoded'] = ''
                            })
                            tasks.push(fs.writeFileAsync(settings.path.wpJson, JSON.stringify(result, null, 4), "utf-8"))
                            resolve(result)
                        })
                });
        })
    })
    .then(function (result) {
        var categoriesRaw = []
        var categoriesTopLevel = {}
        var posts = []
        var categoryAll = {}

        result.channel['wp:category'].forEach(function (entry) {
            var next = {
                id: entry['wp:term_id'][0],
                parent: entry['wp:category_parent'][0],
                niceName: entry['wp:category_nicename'][0],
                name: entry['wp:cat_name'][0]
            }
            categoriesRaw.push(next)
            if (!next.parent) {
                var category = {
                    niceName: next.niceName,
                    name: next.name,
                    url: settings.url + next.niceName,
                    postNumber: 0
                };
                categoriesTopLevel[category.niceName] = category
                categoryAll[category.niceName] = category
            }
        })

        categoriesRaw.forEach(function (entry) {
            if (entry.parent) {
                if (!categoriesTopLevel[entry.parent].children) {
                    categoriesTopLevel[entry.parent].children = [];
                }
                var category = {
                    niceName: entry.niceName,
                    name: entry.name,
                    url: settings.url + entry.parent + '/' + entry.niceName,
                    postNumber: 0
                };
                categoryAll[category.niceName] = category
                categoriesTopLevel[entry.parent].children.push(category);
            }
        })

        result.channel['item'].forEach(function (item) {
            console.log('post type: `' + item['wp:post_type'] + '`')
            console.log('post type?: `' + ((item['wp:post_type'] + '') === 'post') + '`')
            if ((item['wp:post_type'] + '') == 'post') {
                console.log(item.link)
                var next = {
                    title: item.title[0],
                    link: item.link[0],
                    pubDate: item.pubDate[0],
                    shortLink: item.guid[0]
                };
                posts.push(next)

                var match = item.link[0].match(/\/marinatravelblog.com\/(.*)\//);
                if (match && match.length == 2) {
                    next.slug = match[1]
                    next.fileMD = match[1] + '.md'
                } else {
                    next.draft = true
                }

                item.category.forEach(function(itemCategory) {
                    var category = categoryAll[itemCategory.$.nicename];
                    if (category)
                        category.postNumber++;
                })

                console.log(posts[posts.length - 1 ])
            }
        })

        console.log(JSON.stringify(posts, null, 4))

        tasks.push(fs.writeFileAsync(settings.path.posts, JSON.stringify(posts, null, 4)))
        tasks.push(fs.writeFileAsync(settings.path.categories, JSON.stringify(categoriesTopLevel, null, 4)))

        return Promise.all(tasks)
    })
    .then(function () {
        console.log('done')
    })
    .catch(function (err) {
        if (err) {
            console.log(err)
        }
    })

