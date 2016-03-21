var general = require('../lib/general');

var fs = general.fs;
var path = require('path');
var ncp = Promise.promisify(require('ncp').ncp);

var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));
var target = argv.t || argv.target;
var settings = require('../settings.js').loadSync();
var mm = require('../lib/get-post-data/meta-marked');

exports.list = function () {
    return listContent()
        .map(function (file) {
            return fs.readFileAsync(file, 'utf-8').then(function (text) {

                var parsedData = mm(text);

                return {
                    name: path.basename(file),
                    content: parsedData.markdown,
                    meta: parsedData.meta
                }
            })
        })
};

exports.images = function () {
    return listImages()
        .map(function (file) {
            file = path.basename(file);
            return {
                name: file,
                url: 'http://localhost:4002/img/' + file
            }
        })
};

exports.save = function(post) {

};

function listContent() {
    return general.util.listFiles(settings.path.content)
        .filter(function (file) {
            return path.extname(file) === '.md';
        });
}

function listImages() {
    return general.util.listFiles(settings.path.static.img)
        .filter(function (file) {
            return ['.jpg', '.png', '.gif'].indexOf(path.extname(file)) >= 0;
        });
}
