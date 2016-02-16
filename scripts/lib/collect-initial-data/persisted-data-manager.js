var general = require('../general');

var fs = general.fs;
var path = require('path');

function loadImages(settings) {
    return new Promise(function (done) {
        fs.readFileAsync(settings.path.imageInfo)
            .then(JSON.parse)
            .then(done)
            .catch(function (err) {
                console.warn(err);
                done({});
            })
    });
}

function loadResponsiveImgSettings(settings) {
    return fs.readFileAsync(settings.path.responsiveImgSettings)
        .then(JSON.parse);
}

exports.loadImageInfo = loadImages;
exports.loadResponsiveImgSettings = loadResponsiveImgSettings;