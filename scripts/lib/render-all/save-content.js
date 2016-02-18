var general = require('../general');
var fs = general.fs;
var mkdirp = Promise.promisify(require('mkdirp'));
var path = require('path');
var postProcessHtml = require('./post-process').postProcessHtml;

function saveContent(data, htmlPromise, index, folder, ext, fileName) {
    ext = ext || "html";
    fileName = fileName || 'index';
    var html2save;
    var indexPath;

    if (!htmlPromise.then) {
        var text = htmlPromise;
        htmlPromise = new Promise(function(done) {
            done(text);
        });
    }

    return new Promise(function (saveContentDone) {
        htmlPromise.then(function (html) {
            return ext === 'html' ? postProcessHtml(data, html) : html;
        }).then(function (html) {
            html2save = html;

            var publicPath = data.settings.path.public._;

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
                dir = path.join(dir, index.toString());
                return mkdirp(dir).then(function () {
                    return dir;
                })
            }
        }).then(function (dir) {
            indexPath = path.join(dir, fileName + '.' + ext);
            return fs.writeFileAsync(indexPath, html2save);
        }).then(function () {
            saveContentDone();
        });
    })
}

module.exports = saveContent;