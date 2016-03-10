var general = require('../lib/general');

var fs = general.fs;
var path = require('path');
var ncp = Promise.promisify(require('ncp').ncp);

var settings = require('../settings').loadSync();
var mkdirp = Promise.promisify(require('mkdirp'));
var minify = require('html-minifier').minify;

function changeUrlsToProd(text) {
    return text
        .replace(/localhost\:4000\/img/g, 'marinatravelblog.com/wp-content/uploads')
        .replace(/localhost\:4000/g, 'marinatravelblog.com');
}

function prePublish() {
    var src = settings.path.public._;
    var dest = settings.path.public_prod._;

    function process(target) {
        return Promise.map(general.util.listFiles(path.join(dest, target)),
            function (file) {
                if (path.extname(file) === '.'+target) {
                    fs.readFileAsync(file, 'utf-8')
                        .then(function (text) {
                            text = changeUrlsToProd(text);
                            console.log(file)
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

    return Promise.map(general.util.listFiles(src)
        .filter(function (file) {
            return path.extname(file) === '.html' || path.extname(file) === '.xml';
        }),
        function (file) {
            var relPath = file.replace(src, '');
            var folder = path.join(dest, path.dirname(relPath));
            var destFile = path.join(dest, relPath);
            console.log(destFile)
            return mkdirp(folder)
                .then(function () {
                    return fs.readFileAsync(file, 'utf-8')
                })
                .then(function (text) {
                    text = changeUrlsToProd(text);
                    var scripts = '<script src="/js/no-defer.js" async></script><script src="/js/all.js" defer></script>';
                    var css = '<link rel="stylesheet" href="/css/all.css">';
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
                    return fs.writeFileAsync(destFile, text);
                });
        },
        {concurrency: 20})
        .then(processCss)
        .then(processJs);
}

prePublish();