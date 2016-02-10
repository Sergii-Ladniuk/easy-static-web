var general = require('../general');
var fs = general.fs;
var mkdirp = Promise.promisify(require('mkdirp'));
var path = require('path');

function saveContent(data, htmlPromise, index, folder) {
    var html2save;
    return htmlPromise.then(function (html) {
        html2save = html
        var publicPath = data.settings.path.public;

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
    }).then(function(dir) {
        var indexPath = path.join(dir, "index.html");
        return fs.writeFileAsync(indexPath, html2save);
    })
}

module.exports = saveContent;