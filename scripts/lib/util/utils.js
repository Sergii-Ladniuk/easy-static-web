var findit = require('findit');

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
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