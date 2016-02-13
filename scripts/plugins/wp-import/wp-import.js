global.Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs')),
    xml2js = require('xml2js');
var translit = require('translitit-cyrillic-russian-to-latin');
var yaml = require('yamljs');
var extend = require('extend');
var request = require('request');
var util = require('util');
var path = require('path');
var parseArgs = require('minimist');
var argv = require('minimist')(process.argv.slice(2));
var os = require('os');
var newline = os.EOL;
var toMarkdown = require('to-markdown');
var escapeRegExp = require('../../lib/util/utils').escapeRegExp;

var parser = Promise.promisifyAll(new xml2js.Parser());

var settings;
var tasks = [];

var wpFilePath = argv.t || argv.target;
var imgPath = argv.i || argv.img || argv.images;

var featuredInfoCategories = {};
var featuredInfoTags = {};

var taskCompleteCounter = 0;

var wpXmlPath;

function reportDone() {
    taskCompleteCounter++;
    if (taskCompleteCounter % 50 === 0)
        process.stdout.write(".");
}

exports.import = function (xmlFileName) {
    return require('../../settings.js').load
        .then(function (val) {
            settings = val;
            return new Promise(function (resolve) {
                resolve(settings);
                reportDone();
            });
        })
        .then(function () {
            return new Promise(function (resolve) {

                wpXmlPath = path.join(settings.path.wpXml, wpXmlPath || xmlFileName || 'marinatravelblogcom.wordpress.2016-02-10.xml');

                Promise.join(fs.readFileAsync(settings.path.wpJson, "utf-8"), fs.statAsync(wpXmlPath))

                    .spread(function (data, xmlStats) {
                        var xmlModifiedTime = xmlStats.mtime;

                        // cashed json exists and read
                        const wpJson = JSON.parse(data);

                        if (wpJson.cachedTime && (wpJson.cachedTime < xmlModifiedTime && wpJson.wpXmlPath !== wpXmlPath)) {
                            console.log('Cached json expired.');
                            readAndParseWpXml().then(resolve)
                        } else {
                            reportDone();
                            resolve(wpJson)
                        }
                    })
                    .catch(function (err) {
                        console.log('No cached json.');
                        // no cashed json => parse XML
                        resolve(readAndParseWpXml());
                    });
            })
        })

        .then(function (wpJson) {
            var posts = []
            var pages = []

            var categories = {
                tree: {},
                flat: {},
                byId: []
            };

            var answer = parseCategoriesRaw(wpJson);
            var categoriesRaw = answer.categoriesRaw;
            categories.byId = answer.byId;

            function buildCategories() {

            }

            categoriesRaw.forEach(
                function (next) {
                    var category = {
                        niceName: next.niceName,
                        name: next.name,
                        postNumber: 0
                    };
                    if (!next.parent) {
                        //FIXME
                        category.url = 'http://localhost:4000/category/' + next.niceName;
                    } else {
                        //FIXME
                        category.url = 'http://localhost:4000/category/' + next.parent + '/' + next.niceName;
                        category.path = [next.parent, next.niceName];
                        categories.tree[next.parent] = categories.tree[next.parent] || {};
                        categories.tree[next.parent].children = categories.tree[next.parent].children || [];
                        categories.tree[next.parent].children.push(category);
                    }
                    categories.flat[category.niceName] = category;
                    categories.tree[category.niceName] = extend(categories.tree[category.niceName] || {}, category);
                }
            );

            //categoriesRaw.forEach(function (entry) {
            //    if (entry.parent) {
            //        var category = {
            //            niceName: entry.niceName,
            //            name: entry.name,
            //            url: 'http://localhost:4000/category/' + entry.parent + '/' + entry.niceName,
            //            path: [entry.parent, entry.niceName],
            //            postNumber: 0
            //        };
            //        categories.flat[category.niceName] = category;
            //        if (categories.tree[entry.parent]) {
            //            if (!categories.tree[entry.parent].children) {
            //                categories.tree[entry.parent].children = [];
            //            }
            //            categories.tree[entry.parent].children.push(category);
            //        }
            //    }
            //});

            var tags = {};
            wpJson.rss.channel[0]['wp:tag'].forEach(function (rawTag) {
                const name = rawTag['wp:tag_name'][0];
                tags[name] = {
                    id: rawTag['wp:term_id'][0],
                    slug: rawTag['wp:tag_slug'][0]
                }
            });

            var pages = [];
            var menuRaw = [];
            wpJson.rss.channel[0]['item'].forEach(function (item) {
                var postType = item['wp:post_type'][0];
                if (postType === 'post' || postType === 'page') {
                    var id = item['wp:post_id'][0];
                    pages[id] = item['wp:post_name'][0];

                    var next = {
                        title: item.title[0],
                        link: item.link[0],
                        publishedDate: item['wp:post_date'][0],
                        modifiedDate: item['wp:post_date'][0],
                        shortLink: item.guid[0]._,
                        type: postType,
                        draft: item['wp:status'][0] !== 'publish',
                        seo: {}
                    };
                    (item['wp:postmeta'] || []).forEach(function (meta) {
                        switch (meta['wp:meta_key'][0]) {
                            case '_aioseop_keywords' :
                                next.seo.keywords = meta['wp:meta_value'][0].split(',').map(function (kw) {
                                    return kw.replace(/^ +/g, '').replace(/ $/g, '');
                                }).filter(function(kw) {
                                    return kw;
                                });
                                break;
                            case '_aioseop_title' :
                                next.seo.title = meta['wp:meta_value'][0];
                                break;
                            case '_aioseop_description' :
                                next.seo.description = meta['wp:meta_value'][0];
                                break;
                        }
                    });
                    (postType === 'post' ? posts : pages).push(next)
                    // FIXME: hardcoded
                    var match = next.link.match(/\/marinatravelblog.com\/(.*)\//);
                    if (match && match.length == 2) {
                        next.slug = match[1]
                    } else {
                        var postName = item['wp:post_name'][0];//translit(next.title).toLowerCase().replace(/\s+/g, '-');
                        next.slug = postName
                    }

                    if (postType === 'post') {
                        next.categories = [];
                        next.tags = [];
                        item.category.forEach(function (itemCategory) {
                            var domain = itemCategory.$.domain;
                            var nicename = itemCategory.$.nicename;
                            var name = itemCategory._;
                            if (domain === 'category') {
                                next.categories.push(name);
                                var category = categories.flat[nicename];
                                if (category) {
                                    category.postNumber++;
                                }
                            } else if (domain === 'post_tag') {
                                next.tags.push(name);
                            }
                        })
                    }

                    var content = item['content:encoded'][0];
                    content = content.replace(/<!--(more[^]+?)-->/, '{{$1}}')
                        .replace(/<script([^]*?)>([^]*?)<\/script>/g, '[script$1]$2[/script]')
                        .replace(new RegExp(escapeRegExp(newline), 'g'), '<br/>');

                    //downloadImages(content, settings);

                    var mdBody = toMarkdown(content, {
                        converters: [
                            {
                                filter: 'script',
                                replacement: function (content) {
                                    return '<script>' + content + '</script>';
                                }
                            }
                        ]
                    })
                        .replace(/wp-content\/uploads/g, 'img')
                        .replace(/_(\[.*?\))_/, '$1')
                        .replace(/\[caption.*?\]/, '')
                        .replace(/\{\{([^]+?)\}\}/, '<!--$1-->')
                        .replace(/\[script([^]*?)\]([^]*?)\[\/script\]/g, '<script$1>$2</script>');

                    mdBody = extractRelatedPosts(mdBody, next);

                    var mdHead = yaml.stringify(next, 4);
                    var mdAll = util.format('---%s%s%s---%s%s', newline, mdHead, newline, newline, mdBody);

                    var mdPath = path.join(
                        postType === 'post' ?
                            (next.draft ? settings.path.content_posts_drafts :
                                settings.path.content_posts_published) :
                            (next.draft ? settings.path.content_pages_drafts :
                                settings.path.content_pages_published),
                        next.slug + '.md');

                    tasks.push(fs.writeFileAsync(mdPath, mdAll).then(reportDone));
                    reportDone();
                }

                if (postType === 'nav_menu_item') {
                    var next = {};
                    item['wp:postmeta'].forEach(function (meta) {
                        var value = meta['wp:meta_value'][0];
                        switch (meta['wp:meta_key'][0]) {
                            case '_menu_item_object' :
                                next.class = value;
                                break;
                            case '_menu_item_object_id':
                                next.id = parseInt(value);
                                break;
                            case '_menu_item_menu_item_parent':
                                next.parentId = parseInt(value);
                                break;
                        }
                    });
                    next.order = parseInt(item['wp:menu_order'][0]);
                    menuRaw.push(next);
                }
            });

            menuRaw.sort(function (a, b) {
                return a.order - b.order;
            })

            var menu = [];

            menuRaw.forEach(function (item) {
                // todo handle items with parent
                if (item.class && !item.parentId) {
                    if (item.class === 'page') {
                        var page = pages[item.id];
                        if (page) {
                            menu.push(page);
                        }
                    } else if (item.class === 'category') {
                        var category = categories.byId[item.id];
                        if (category) {
                            menu.push(category);
                        }
                    }
                }
            });

            tasks.push(fs.writeFileAsync(settings.path.tags, JSON.stringify(tags, null, 4)).then(reportDone))
            tasks.push(fs.writeFileAsync(settings.path.posts, JSON.stringify(posts, null, 4)).then(reportDone))
            tasks.push(fs.writeFileAsync(settings.path.featuredText, JSON.stringify({
                featuredInfoTags: featuredInfoTags,
                featuredInfoCategories: featuredInfoCategories
            }, null, 4)).then(reportDone))
            tasks.push(fs.writeFileAsync(settings.path.categories, JSON.stringify(categories.tree, null, 4)).then(reportDone))

            return Promise.all(tasks);
        })
        .then(function () {
            console.log('DONE.');
            return true;
        });
};

if (argv.r) {
    exports.import();
}

function extractRelatedPosts(content, meta) {
    var lines = content.split(/\n/g);
    var lastEntry = -1;
    for (var i = lines.length - 1; i >= lines.length - 10 && i >= 0; i--) {
        var line = lines[i];
        var prevLine = lines[i - 1];
        var info;
        var current;
        if (/\[catlist/.test(line)) {
            lastEntry = i - 1;
            var matchTag = /tags *?= *?\"(.+?)\"/.exec(line);
            if (matchTag && matchTag[1]) {
                current = meta['featured-tag'] = matchTag[1];
                if (info = /\*\*(.*?)\*\*/.exec(prevLine)) {
                    featuredInfoTags[current] = info[1];
                }
            }
            var matchCategory = /name *= *?\"(.+?)\"/.exec(line);
            if (matchCategory && matchCategory[1]) {
                current = meta['featured-category'] = matchCategory[1];
                if (info = /\*\*(.*?)\*\*/.exec(prevLine)) {
                    featuredInfoCategories[current] = info[1];
                }
            }
        }
    }
    // skip empty lines
    while (!/[ \n\r]*/.test(lines[lastEntry])) {
        lastEntry--;
    }
    if (lastEntry > 0) {
        return lines.splice(0, lastEntry).join('\n');
    } else {
        return content;
    }
}

function parseCategoriesRaw(wpJson) {
    var categoriesRaw = [];
    var byId = [];

    wpJson.rss.channel[0]['wp:category'].forEach(function (entry) {
        var next = {
            id: entry['wp:term_id'][0],
            parent: entry['wp:category_parent'][0],
            niceName: entry['wp:category_nicename'][0],
            name: entry['wp:cat_name'][0]
        }
        byId[next.id] = next.niceName;
        categoriesRaw.push(next)
    });

    categoriesRaw.sort(function (a, b) {
        a = a.name.toLowerCase();
        b = b.name.toLowerCase();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });

    return {
        categoriesRaw: categoriesRaw,
        byId: byId
    }
}

function readAndParseWpXml() {
    console.log('Parsing WP XML...')
    return fs.readFileAsync(wpXmlPath)
        .then(parser.parseStringAsync)
        .then(function (result) {
            result.cachedTime = new Date();
            result.wpXmlPath = wpXmlPath;
            tasks.push(fs.writeFileAsync(settings.path.wpJson, JSON.stringify(result, null, 4), "utf-8"))
            reportDone();
            console.log('Parsing WP XML Done.')
            return result;
        });
}

var download = function (uri, filename) {
    return new Promise(function (done) {
        request.head(uri, function (err, res, body) {
            if (err) {
                console.log('Failed download : ' + uri)
                console.error(err);
            } else {
                if (res.status === 200) {
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);

                    try {
                        request(uri).pipe(fs.createWriteStream(filename)).on('close', function () {
                            done();
                        });
                    } catch (err) {
                        console.error('cannot download ' + uri)
                        done();
                    }
                }
            }
        });
    });
};

var fileExists = function (file) {
    return fs
        .readFileAsync(file)
        .then(function (res) {
            return true;
        })
        .catch(function (err) {
            return false;
        });
}

var visitedImages = {};

function downloadImages(content, settings) {
    var regexUrl = new RegExp('src=\"(.*?wp-content\/uploads\/.*?\.(jpg|png|gif))', 'g'),
        regexFile = new RegExp('wp-content\/uploads\/(.*?\.(jpg|png|gif))'),
        m;
    while (m = regexUrl.exec(content)) {
        (function (m) {
            var url = m[1];
            var img = regexFile.exec(url)[1];

            if (typeof img === 'string' && !(img in visitedImages)) {
                visitedImages[img] = true;
                const file = path.join(settings.path.public.img, img);
                var task = fileExists(file)
                    .then(function (exists) {
                        if (!exists) {
                            //console.log('downloading ' + file);
                            return download(url, file)
                                .then(function () {
                                    console.log('downloaded ' + file);
                                })
                        } else {
                            //console.log('exists '+ file);
                            return 'exists';
                        }
                    });
                tasks.push(task);
            }
        })(m);
    }
}