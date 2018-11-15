'use strict';

const mainModule = require('../general.js');
const path = require('path');
const fs = mainModule.fs;
const sharp = require('sharp');
const gm = mainModule.gm;
const util = require('util');
const ncp = Promise.promisify(require('ncp').ncp);
const gmSemaphor = require('semaphore')(20);
var mkdirp = Promise.promisify(require('mkdirp'));
var findit = require('findit');

var compressTasks = [];


gmSemaphor.takeAsync = function () {
    return new Promise(function (done) {
        gmSemaphor.take(function () {
            done();
        });
    });
};

var imgDone = 0;

function reportDoneImage() {
    imgDone++;
    if (imgDone % 100 === 0) {
        process.stdout.write(".");
    }
}

var compressing = {};

function resize(fullFileName, sizes, settings, actualWidth) {
    if (!compressing[fullFileName]) {
        compressing[fullFileName] = true;
    } else {
        return;
    }

    var parsedName = path.parse(fullFileName);
    var fileName = parsedName.name;
    var ext = parsedName.ext;

    ['lg', 'md', 'sm', 'xlg'].forEach(function (sizeLevel) {
        var width = sizes[sizeLevel];
        var suffix = '';
        if (sizeLevel !== 'lg') {
            suffix = '-' + sizeLevel;
        }

        var srcPath = path.join(settings.path.static.img, fullFileName);
        var outputFilePath = path.join(settings.path.public.img, fileName + suffix + ext);

        var compressPromise = exists(outputFilePath).then(function (exists) {
            if (!exists) {
                var promise;

                if (actualWidth >= sizes[sizeLevel])
                    promise = gmSemaphor.takeAsync()
                        .then(function () {
                            return new Promise((done, fail) => {
                                sharp(srcPath)
                                    .resize(sizes[sizeLevel])
                                    .toFile(outputFilePath, err => {
                                        if (err) {
                                            console.log('Error during img resizing', err);
                                            fail(err)
                                        } else {
                                            console.log('Image saved to ' + outputFilePath)
                                            done()
                                        }
                                    })
                            });
                        });
                else {
                    promise = gmSemaphor.takeAsync()
                        .then(function () {
                            if (sizeLevel !== 'xlg') {
                                return ncp(srcPath, outputFilePath);
                            }
                        })
                        .delay(500)
                        .catch(function (err) {
                            console.log('compress copy error', srcPath, outputFilePath, err);
                        });
                }

                return promise.then(function () {
                    gmSemaphor.leave();
                    reportDoneImage();
                })
                    .then(function () {
                        return true;
                    });

            } else {
                return true;
            }
        });

        compressTasks.push(compressPromise);
    });

    return Promise.all(compressTasks);
}


function processImage(data, fileName, alt, title, sizes, imageInfo, template, imageIndex) {
    //console.log('process ', fileName);
    var settings = data.settings || data.basic.settings;
    var filePath = path.join(settings.path.static.img, fileName);
    var gmAsync = Promise.promisifyAll(gm(filePath));
    var srcPath = path.join(settings.path.static.img, fileName);
    var outputFilePath = path.join(settings.path.public.img, fileName);
    var outputFilePathProd = path.join(settings.path.public_prod.img, fileName);
    return gmSemaphor.takeAsync()
        .then(function () {
            return gmAsync.sizeAsync()
        })
        .catch(err => handleImgProcessError(err, srcPath, outputFilePath, outputFilePathProd))
        .then(function (size) {
            gmSemaphor.leave();

            reportDoneImage();

            if (!size) {
                console.log('false');
                return false;
            }

            var css = processCss(size, imageInfo);

            if (size.width > sizes.sm + 100) {
                resize(fileName, sizes, settings, size.width);

                var parsed = path.parse(fileName);

                var xlg = size.width >= 2000;

                var html = template({
                    file: parsed.name,
                    ext: parsed.ext,
                    title: title,
                    alt: alt,
                    css: css,
                    xlg,
                    width: size.width,
                    imageIndex
                });


                imageInfo.images[fileName] = {
                    mtime: new Date(),
                    html: html
                };

                return html;
            } else {
                console.log('copy', srcPath, outputFilePath);
                console.log('copy', srcPath, outputFilePathProd);
                ncp(srcPath, outputFilePath);
                //ncp(srcPath, outputFilePathProd);
                imageInfo.images[fileName] = {
                    mtime: new Date(),
                    html: false,
                    error: 'too small file'
                };
                return false;
            }

        })
}

function handleImgProcessError(err, srcPath, outputFilePath, outputFilePathProd) {
    console.log(err);
    console.log('process copy', srcPath, outputFilePath);
    console.log('process copy', srcPath, outputFilePathProd);
    ncp(srcPath, outputFilePath).catch(function (err) {
        console.log('process copy error', srcPath, outputFilePath, err);
    });
    imageInfo.images[fileName] = {
        mtime: new Date(),
        html: false,
        err: err
    };
    return null;
}

function processCss(size, imageInfo) {
    var padding = Math.floor(size.height / size.width * 100 + 0.1) + 1;
    var sizeClass = util.format('p%d', padding);
    if (!imageInfo.cssNames[sizeClass]) {
        imageInfo.css += util.format('.%s{ padding-bottom:%d%%;}', sizeClass, padding);
        imageInfo.cssNames[sizeClass] = true
    }
    return sizeClass;
}

function imgTemplate(data) {
    var promise = data.jadeTemplates || data.basic.jadeTemplates;
    if (promise.then) {
        return promise.then(function (templates) {
            return templates.jadeTemplates['img.jade']
        }).then(function (template) {
            return template;
        });
    } else {
        return promise['img.jade'];
    }
}

function exists(file) {
    return new Promise(function (done) {
        fs.stat(file, function (err, stat) {
            if (err == null) {
                done(true);
            } else if (err.code === 'ENOENT') {
                done(false);
            } else {
                console.error('Unexpected error when check exists: ', err);
                done(false);
            }
        });
    });
}

function handleImg(data, url, alt, title, sizes, imageIndex) {
    var settings = data.settings || data.basic.settings;
    var fileName = path.basename(url);
    var srcPath = path.join(settings.path.static.img, fileName);

    return new Promise(function (handleImgDone) {
        exists(srcPath).then(function (exists) {
            var imageInfo = data.imageInfo || data.basic.imageInfo;
            var info = imageInfo.images[fileName];
            if (exists) {
                return Promise.join(
                    fs.statAsync(srcPath),
                    imgTemplate(data))
                    .spread(function (srcStats, template) {
                        if (typeof template !== 'function')
                            throw new Error('bad template');
                        var srcModifiedDate = srcStats.mtime;
                        if (!info || !srcModifiedDate <= info.mtime) {
                            processImage(
                                data, fileName, alt, title, sizes,
                                imageInfo, template, imageIndex).then(handleImgDone);
                        } else {
                            handleImgDone(imageInfo.images[fileName].html);
                        }
                    })
            } else {
                if (info) {
                    handleImgDone(imageInfo.images[fileName].html);
                } else {
                    handleImgDone(false);
                }
            }
        });
    })
}

exports.saveImgInfo = function (data) {
    var settings = data.settings || data.basic.settings;
    var imageInfo = data.imageInfo || data.basic.imageInfo;
    return fs.writeFileAsync(settings.path.imageInfo, JSON.stringify(data.imageInfo, null, 2))
        .then(function () {
            return data;
        });
};

var general = require('../general');

function listImages(data) {
    var imgFolder = data.settings.path.static.img;
    return general.util.listFiles(imgFolder);
}

exports.handleImg = handleImg;