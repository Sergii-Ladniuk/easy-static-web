var general = require('../lib/general');

var fs = general.fs;
var path = require('path');

var settings = require('../settings').loadSync();
var mkdirp = Promise.promisify(require('mkdirp'));
var minify = require('html-minifier').minify;
const ncp = Promise.promisify(require('ncp').ncp);
var critical = require('critical');

var version;

function changeUrlsToProd(text) {
    return text
        .replace(/localhost\:4000\/*img/g, 'marinatravelblog.com/wp-content/uploads')
        .replace(/localhost\:4000/g, 'marinatravelblog.com');
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
            // FIXME!!!
            //publishInfo["asset-version"]++;
            return Promise.join(
                publishInfo,
                fs.readFileAsync(path.join(settings.path.public_prod._, 'js', 'all.js'), 'utf-8'),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'js', 'all-' + version + '.js'), 'utf-8'),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'css', 'all.css'), 'utf-8'),
                fs.readFileAsync(path.join(settings.path.public_prod._, 'css', 'all-' + version + '.css'), 'utf-8')
            );
        })
        .spread(function (publishInfo, jsNew, jsOld, cssNew, cssOld) {
            console.log('css length', cssNew.length)
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
            var generateCriticalCss = Promise.promisify(critical.generate);
            return Promise.join(
                generateCriticalCss({
                    base: settings.path.public._,
                    src: 'index.html',
                    width: 1300,
                    height: 900,
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
                    var folder = path.join(dest, path.dirname(relPath));
                    var destFile = path.join(dest, relPath);
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

                            text = changeUrlsToProd(text);

                            text = text
                                .replace(/<!-- *\[ *scripts *-->[^]*?<!-- *scripts *\] *-->/g, scripts)
                                .replace(/<!-- *\[ *css *-->[^]*?<!-- *css *\] *-->/g, css);

                            text = minify(text, {
                                removeAttributeQuotes: true,
                                removeComments: true,
                                collapseWhitespace: true,
                                conservativeCollapse: false,
                                collapseBooleanAttributes: true,
                                removeTagWhitespace: true,
                                removeAttributeQuotes: true,
                                useShortDoctype: true
                            });
                            reportProgress();
                            return fs.writeFileAsync(destFile, text);
                        });
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
//prePublish();

var opDone = 0;
function reportProgress() {
    if (opDone % 1000 === 0) {
        process.stdout.write(".");
    }
}