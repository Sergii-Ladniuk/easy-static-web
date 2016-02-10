global.Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const findit = Promise.promisifyAll(require('findit'));
const path = require('path');
const script = {};
require('./../settings.js').load
    .then(function (settings) {
        script.settings = settings;
        script.imgs = {}
        var imgFinder = findit(settings.path.source.img)
        var tasks = []
        imgFinder.on('file', function (filePath, stat) {
            if (!/\/\./.test(filePath)) {
//                console.log(filePath)
                var match = filePath.match(/\/([^\/]+)\.[a-z]{3}$/);
                var fileName = match[1]
                script.imgs[fileName] = {
                    path: filePath,
                    useCount: 0
                }
            }
        })
        return new Promise(function (done) {
            imgFinder.on('end', function () {
                done()
            })
        })
    })
    .then(function () {
        var postFinder = findit(script.settings.path.hugoContentFolder)
        var tasks = []
        postFinder.on('file', function (filePath) {
            var readFileAsync = fs.readFileAsync(filePath, "utf-8");
            tasks.push(readFileAsync)
            readFileAsync.then(function (data) {
//                console.log(filePath)
                var imgRegex = /\/([^\/[]+)\.[a-z]{3}/g
                var matches
                while (matches = imgRegex.exec(data)) {
                    var img = script.imgs[matches[1]];
                    if (img) {
                        img.useCount++;
                    } else {
                        console.error(matches[1] + " not found!")
                    }
                }
                var imgRegex = /\{\{% img \".*\" \"(.*)\.[a-z]{3}\" %\}\}/g
                var matches
                while (matches = imgRegex.exec(data)) {
                    var img = script.imgs[matches[1]];
                    if (img) {
                        img.useCount++;
                    } else {
                        console.error(matches[1] + " not found!")
                    }
                }
            })
        })
        return new Promise(function (done) {
            postFinder.on('end', function () {
                Promise.all(tasks).then(done)
            })
        })
    })
    .then(function () {
        for (var p in script.imgs) {
            var img = script.imgs[p]
            if (img.useCount === 0) {
                console.log('rm ' + img.path)
                fs.unlink(img.path)
            }
        }
    })
