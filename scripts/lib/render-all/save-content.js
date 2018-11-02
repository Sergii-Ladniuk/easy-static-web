var general = require('../general');
var fs = general.fs;
var mkdirp = Promise.promisify(require('mkdirp'));
var path = require('path');
var postProcessHtml = require('./post-process').postProcessHtml;
var htmlStorage = require('./html-storage');

function saveContent(data, htmlPromise, index, folder, ext, fileName) {
    var ext = ext || "html";
    var fileName = fileName || 'index';

    if (folder === '404') {
        folder = '';
        fileName = '404';
    }

    var publicPath = data.settings.path.public._;

    if (htmlStorage.storeInMemory) {
        var htmlPath = '';

        if (folder) {
            htmlPath = path.join(htmlPath, folder);
        }

        if (index) {
            htmlPath = path.join(htmlPath, 'page/' + index.toString())
        }

        htmlPath = path.join(htmlPath, fileName + '.' + ext);

        if (!htmlPromise.then) {
            var text = htmlPromise;
            htmlPromise = new Promise(function (done) {
                done(text);
            });
        }

        return htmlPromise.then(function(html) {
            return postProcessHtml(data, html);
        }).then(function(html) {
            return htmlStorage.htmls[htmlPath] = html;
        })
    } else {

        return new Promise(function (saveContentDone) {
            var html2save;
            var indexPath;

            if (!htmlPromise.then) {
                var text = htmlPromise;
                htmlPromise = new Promise(function (done) {
                    done(text);
                });
            }

            htmlPromise.then(function (html) {
                return ext === 'html' ? postProcessHtml(data, html) : html;
            }).then(function (html) {
                html2save = html;

                if (!folder) {
                    return publicPath;
                } else {
                    var dir = path.join(publicPath, folder);
                    return mkdirp(dir).then(function () {
                        return dir;
                    })
                }
            }).then(function (dir) {
                if (!index) {
                    return dir;
                } else {
                    dir = path.join(dir, 'page/' + index.toString());
                    return mkdirp(dir).then(function () {
                        return dir;
                    })
                }
            }).then(function (dir) {
                indexPath = path.join(dir, fileName + '.' + ext);
                // console.log("Saving " + indexPath);
                return fs.writeFileAsync(indexPath, html2save);
            }).then(function () {
                saveContentDone();
            }).catch(function(err) {
                "use strict";
                console.log("Failed to save content", err);
            });
        })
    }
}

module.exports = saveContent;