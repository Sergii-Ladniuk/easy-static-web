var general = require('../lib/general');

var fs = general.fs;
var path = require('path');

var settings = require('../settings').loadSync();
var mkdirp = Promise.promisify(require('mkdirp'));
var minify = require('html-minifier').minify;
const ncp = Promise.promisify(require('ncp').ncp);
var critical = require('critical');
var data;
var posts = {};
var rimraf = require('rimraf');
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));
var run = argv.r || argv.run;

var version;

function changeUrlsToProd(text) {
    return text
        .replace(/local.marinatravelblog.com\:4000\/*img/g, 'marinatravelblog.com/wp-content/uploads')
        .replace(/localhost\:4000\/*img/g, 'marinatravelblog.com/wp-content/uploads')
        .replace(/local.marinatravelblog.com\:4000/g, 'marinatravelblog.com');
}

function prePublish() {
    var src = settings.path.public._;
    var dest = settings.path.public_prod._;

    function process(target) {
        return Promise.map(general.util.listFiles(path.join(dest, target)),
            function (file) {
                if (path.extname(file) === '.' + target) {
                    return fs.readFileAsync(file, 'utf-8')
                        .then(function (text) {
                            text = changeUrlsToProd(text);
                            return fs.writeFileAsync(file, text);
                        })
                }
            },
            {concurrency: 20});
    }

    function processCss() {
        return process('css');
    }

    function processJs() {
        return process('js');
    }

    return fs.readFileAsync(settings.path.content_publish_json, 'utf-8')
        .then(JSON.parse)
        .then(function (publishInfo) {
            version = publishInfo["asset-version"];
            return Promise.join(
                publishInfo,
                fs.readFileAsync(path.join(settings.path.public_prod._, 'js', 'all.js'), 'utf-8'),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'js', 'all-' + version + '.js'), 'utf-8'),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'css', 'all.css'), 'utf-8'),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'css', 'all-' + version + '.css'), 'utf-8'),
                fs.readFileAsync(settings.path.oldData)
            );
        })
        .spread(function (publishInfo, jsNew, jsOld, cssNew, cssOld, oldData) {
            data = JSON.parse(oldData);
            data.posts.forEach(function (post) {
                posts[post.meta.slug] = post;
            });
            console.log('current version', version)
            console.log('css length', cssNew.length)
            console.log('jsNew !== jsOld || cssNew !== cssOld', jsNew !== jsOld || cssNew !== cssOld);
            console.log('jsNew !== jsOld', jsNew !== jsOld)
            console.log('cssNew !== cssOld', cssNew !== cssOld)
            if (jsNew !== jsOld || cssNew !== cssOld) {
                version = ++publishInfo["asset-version"];
                console.log('issue new version of css&js : ', version);
                return Promise.join(
                    ncp(path.join(settings.path.public_prod._, 'js', 'all.js'),
                        path.join(settings.path.public_prod._, 'js', 'all-' + version + '.js')),
                    ncp(path.join(settings.path.public_prod._, 'css', 'all.css'),
                        path.join(settings.path.public_prod._, 'css', 'all-' + version + '.css')),
                    fs.writeFileAsync(settings.path.content_publish_json, JSON.stringify(publishInfo))
                );
            } else {
                return true;
            }
        })
        .then(processCss)
        .then(processJs)
        .then(function () {
            return fs.readFileAsync(path.join(settings.path.public._, 'ekvador-ozero-kilotoa-quilotoa/index.html'))
                .then(text => {
                    let updated = text.replace('')
                })
        })
        .then(function () {
            var generateCriticalCss = Promise.promisify(critical.generate);
            return Promise.join(
                generateCriticalCss({
                    base: settings.path.public._,
                    src: 'ekvador-ozero-kilotoa-quilotoa/index.html',
                    dimensions: [{
                        width: 1300,
                        height: 600
                    }, {
                        width: 320,
                        height: 640
                    }, {
                        width: 1600,
                        height: 600
                    }],
                    minify: true
                }),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'js', 'no-defer.js'), 'utf-8')
            )
        })
        .spread(function (criticalCss, nodeferJs) {
            console.log('criticalCss length', criticalCss.length);
            nodeferJs = nodeferJs.replace(/\{version\}/g, version);
            console.log('processing&minifying html...');
            return Promise.map(general.util.listFiles(src)
                .filter(function (file) {
                    return path.extname(file) === '.html' || path.extname(file) === '.xml';
                }),
                function (file) {
                    var relPath = file.replace(src, '');
                    var slug = path.dirname(relPath);
                    var folder = path.join(dest, slug);
                    var destFile = path.join(dest, relPath);
                    if (posts[slug] && posts[slug].meta.draft) {
                        rimraf(path.join(dest, slug), function (err) {
                        });
                        return false;
                    } else {
                        return mkdirp(folder)
                            .then(function () {
                                return fs.readFileAsync(file, 'utf-8')
                            })
                            .then(function (text) {
                                var scripts =
                                    '<script>' + nodeferJs + '</script>';

                                var css =
                                    '<noscript><link rel="stylesheet" href="/css/all-' + version + '.css"></noscript>' +
                                    '<style>' + criticalCss + '</style>';

                                text = text
                                    .replace(/<!-- *\[ *scripts *-->[^]*?<!-- *scripts *\] *-->/g, scripts)
                                    .replace(/<!-- *\[ *css *-->[^]*?<!-- *css *\] *-->/g, css);

                                text = changeUrlsToProd(text);

                                if (path.extname(file) === '.html') {
                                    text = minify(text, {
                                        removeAttributeQuotes: true,
                                        removeComments: true,
                                        collapseWhitespace: true,
                                        conservativeCollapse: false,
                                        collapseBooleanAttributes: true,
                                        removeTagWhitespace: true,
                                        removeAttributeQuotes: true,
                                        useShortDoctype: true,
                                        minifyJS: true
                                    });
                                }

                                reportProgress();
                                return fs.writeFileAsync(destFile, text);
                            });
                    }
                },
                {concurrency: 20})
                .catch(function (err) {
                    console.error(err);
                    var stack = new Error().stack;
                    console.log(stack)
                });
        })
}

module.exports = prePublish;

if (run) {
    prePublish();
}

var opDone = 0;
function reportProgress() {
    if (opDone % 1000 === 0) {
        process.stdout.write(".");
    }
}
