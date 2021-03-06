var findit = require('findit');
var slugify = require('uslug');
var translit = require('translitit-cyrillic-russian-to-latin');

var slugifyOptions = {allowedChars: '-'};

function slugifyTranslit(str) {
    return slugify(translit(str), slugifyOptions);
}

function slugifyOnly(str) {
    return slugify(str, slugifyOptions);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$&");
}

function listFiles(dir) {
    return new Promise(function (fulfil) {

        var postFinder = findit(dir);
        var files = [];

        postFinder.on('file', function (filePath) {
            files.push(filePath);
        });

        postFinder.on('end', function () {
            fulfil(files);
        })
    })
}


exports.escapeRegExp = escapeRegExp;
exports.listFiles = listFiles;
exports.slugifyTranslit = slugifyTranslit;
exports.slugifyOnly = slugifyOnly;