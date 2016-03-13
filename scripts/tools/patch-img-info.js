var settings;
var persistedDataManager = require('../lib/collect-initial-data/persisted-data-manager');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var jade = require('jade');

require('../settings.js').load
    .then(function (v) {
        settings = v;
    })
    .then(function () {
        return Promise.join(
            persistedDataManager.loadImageInfo(settings),
            fs.readFileAsync(path.join(settings.path.layouts, 'embed', 'img.jade'), "utf-8")
        );
    })
    .spread(function (imgs, templateText) {
        var template = jade.compile(templateText, {
            //filename: filePath,
            pretty: true
        });
        for (var imgName in imgs.images) {
            var imgInfo = imgs.images[imgName];
            if (imgInfo.html) {
                var m = /class=\".*?p([0-9]+)\"[^]*?data-alt=\"(.*?)\" *data-s=\"(.*?)\" data-ext=\"(.*?)\"/.exec(imgInfo.html);
                if (m && m[4]) {
                    imgInfo.css = 'p' + m[1];
                    imgInfo.padding = m[1];
                    imgInfo.alt = m[2];
                    imgInfo.file = m[3];
                    imgInfo.ext = m[4];
                    imgInfo.html = template(imgInfo);
                }
            }
        }
        return fs.writeFileAsync(settings.path.imageInfo, JSON.stringify(imgs, null, 4));
    });
