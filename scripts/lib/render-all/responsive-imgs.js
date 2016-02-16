'use strict';

const mainModule = require('../general.js');
const path = require('path');
const fs = mainModule.fs;
const gm = mainModule.gm;
const util = require('util');
const ncp = Promise.promisify(require('ncp').ncp);
const gmSemaphor = require('semaphore')(5);
var mkdirp = Promise.promisify(require('mkdirp'));
var findit = require('findit');


gmSemaphor.takeAsync = function () {
    return new Promise(function (done) {
        gmSemaphor.take(function () {
            done();
        });
    });
};

//gmSemaphor.takeAsync = function () {
//    return new Promise(function (done) {
//        done();
//    });
//}
//gmSemaphor.leave = function () {
//
//}

var imgDone = 0;
function reportDoneImage() {
    imgDone++;
    if (imgDone % 50) {
        process.stdout.write(".");
    }
}

function compress(fullFileName, gmAsync, sizes, settings) {
    var parsedName = path.parse(fullFileName);
    var fileName = parsedName.name;
    var ext = parsedName.ext;
    var tasks = [];

    ['lg', 'md', 'sm'].forEach(function (sizeLevel) {
        var width = sizes[sizeLevel];
        var suffix = '';
        if (sizeLevel !== 'lg') {
            suffix = '-' + sizeLevel;
        }

        var outputFilePath = path.join(settings.path.public.img, fileName + suffix + ext);
        var outputFilePathProd = path.join(settings.path.public_prod.img, fileName + suffix + ext);

        var promise;

        return gmSemaphor.takeAsync()
            .then(function () {
                promise = gmAsync
                    .resize(sizes[sizeLevel])
                    .quality(100)
                    //.unsharp(0.3, 1.0, 85, 4)
                    .writeAsync(outputFilePath)
                ;
                tasks.push(promise);
                return promise;
            })
            .then(function () {
                reportDoneImage();
                return ncp(outputFilePath, outputFilePathProd);
            })
            .then(function () {
                gmSemaphor.leave();
                return true;
            });


    });

    return Promise.all(tasks);
}

function processImage(data, fileName, alt, title, sizes, imageInfo, template) {
    var settings = data.settings || data.basic.settings;
    var filePath = path.join(settings.path.static.img, fileName);
    var gmAsync = Promise.promisifyAll(gm(filePath));
    return gmSemaphor.takeAsync()
        .then(function () {
            return gmAsync.sizeAsync()
        })
        .catch(function (err) {
            console.log(err);
            imageInfo.images[fileName] = {
                mtime: new Date(),
                html: false,
                err: err
            };
            return null;
        })
        .then(function (size) {
            gmSemaphor.leave();

            if (!size) {
                console.log('false');
                return false;
            }

            var css = processCss(size, imageInfo);

            //var compressPromise;
            //if (size.width >= sizes.lg) {
            //    compressPromise = compress(fileName, gmAsync, sizes, settings);
            //} else {
            //    var srcPath = path.join(settings.path.static.img, fileName);
            //    var outputFilePath = path.join(settings.path.public.img, fileName);
            //    var outputFilePathProd = path.join(settings.path.public_prod.img, fileName);
            //    ncp(srcPath, outputFilePath);
            //    ncp(srcPath, outputFilePathProd);
            //    imageInfo.images[fileName] = {
            //        mtime: new Date(),
            //        html: false,
            //        error: 'too small file'
            //    };
            //    return false;
            //}

            var parsed = path.parse(fileName);

            var html = template({
                file: parsed.name,
                ext: parsed.ext,
                title: title,
                alt: alt,
                css: css
            });


            imageInfo.images[fileName] = {
                mtime: new Date(),
                html: html
            };

            return html;
        })
}

function processCss(size, imageInfo) {
    var padding = Math.floor(size.height / size.width * 100 + 0.1) + 1;
    var sizeClass = util.format('p%d', padding);
    if (!imageInfo.cssNames[sizeClass]) {
        imageInfo.css += util.format('.%s{ padding-bottom:%d%%;}', sizeClass, padding)
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
            } else if (err.code == 'ENOENT') {
                done(false);
            } else {
                console.error('Unexpected error: ', err);
                done(false);
            }
        });
    });
}

function handleImg(data, url, alt, title, sizes) {
    var settings = data.settings || data.basic.settings;
    var fileName = path.basename(url);
    var srcPath = path.join(settings.path.static.img, fileName);

    return new Promise(function (handleImgDone) {
        exists(srcPath).then(function (exists) {
            if (exists) {
                return Promise.join(
                    fs.statAsync(srcPath),
                    imgTemplate(data))
                    .spread(function (srcStats, template) {
                        var imageInfo = data.imageInfo || data.basic.imageInfo;
                        if (typeof template !== 'function')
                            throw new Error('bad template');
                        var info = imageInfo.images[fileName];
                        var srcModifiedDate = srcStats.mtime;
                        if (!info || !srcModifiedDate <= info.mtime) {
                            processImage(
                                data, fileName, alt, title, sizes,
                                imageInfo, template).then(handleImgDone);
                        } else {
                            handleImgDone(imageInfo.images[fileName].html);
                        }
                    })
            } else {
                handleImgDone(false);
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

exports.removeUseless = function (data) {
    var imageInfo = data.imageInfo || data.basic.imageInfo;
    var imgFolder = data.settings.path.static.img;
    var unusedFolder = path.join(imgFolder, 'unused');
    var usedFolderJpg = path.join(imgFolder, 'used-jpg');
    var usedFolderOther = path.join(imgFolder, 'used-other');
    var postFinder = findit(imgFolder);
    var tasks = [];

    var dirs = [
        mkdirp(unusedFolder),
        mkdirp(usedFolderJpg),
        mkdirp(usedFolderOther)
    ];
    return Promise.all(dirs)
        .then(function () {
            return Promise.map(listImages(data), function (filePath) {
                var name = path.basename(filePath);
                var ext = path.extname(filePath);
                var promise;
                if (!imageInfo.images[name]) {
                    promise = ncp(filePath, path.join(unusedFolder, name))
                } else {
                    if (ext === '.jpg') {
                        promise = ncp(filePath, path.join(usedFolderJpg, name))
                    } else {
                        promise = ncp(filePath, path.join(usedFolderOther, name))
                    }
                }
                return promise;
            }, {concurrency: 5});
        })
        .then(function () {
            console.log('remove unused img done');
        })

    //.then(function () {
    //    postFinder.on('file', function (filePath) {
    //
    //        var name = path.basename(filePath);
    //        if (!imageInfo.images[name]) {
    //            //console.log('copy',filePath, path.join(unusedFolder, name))
    //            //console.log('delete',filePath)
    //            var promise = ncp(filePath, path.join(unusedFolder, name))
    //                .then(function () {
    //                    return fs.unlinkAsync(filePath);
    //                });
    //            tasks.push(promise);
    //        }
    //    });
    //    return new Promise(function (done) {
    //        postFinder.on('end', function () {
    //            Promise.all(tasks).then(done)
    //        })
    //    })
    //})
};

exports.handleImg = handleImg;

//
//
//var ResponsiveImgs = function () {
//    this.css = "";
//    this.cssNames = {}
//};
//
///**
// * Replaces md image tags with div/noscript for responsive images
// * @returns {Array} array
// */
//ResponsiveImgs.prototype.replaceImgs = function (data, settings) {
//    // replace img notations with shortcodes http://gohugo.io/extras/shortcodes/
//    // ![Баньос, Тунгурауа, Эквадор](http://localhost:4000/img/Banos-Tingurahua-Ecuador-3.jpg)
//    // ==>
//    // {{% img "Баньос, Тунгурауа, Эквадор" "http://localhost:4000/img/Banos-Tingurahua-Ecuador-3.jpg" %}}
//
//    var imgRegex = /!\[([^\(]+)]\(([^\)]+)\)/g;
//    var next
//    var gmPromises = []
//    var me = this;
//    while (next = imgRegex.exec(data)) {
//        (function (oldImg, alt, fileUrl) {
//            // todo not only jpg ?
//            var match = /\/([^\/]+)\.jpg/.exec(fileUrl);
//            if (match && match.length === 2) {
//                var fileName = match[1] + '-lg.jpg';
//                var fileNameShort = match[1];
//                var gmPromise = new Promise(function (done, reject) {
//                    //FIXME
//                    var filePath = path.join(settings.path.wpImg, fileName);
//                    gm(filePath)
//                        .size(function (err, size) {
//                            if (!err) {
//                                var padding = Math.floor(size.height / size.width * 100 + 0.1) + 1;
//                                var sizeClass = util.format('p%d', padding);
//                                if (!me.cssNames[sizeClass]) {
//                                    me.css += util.format('.%s{ padding-bottom:%d%%;}', sizeClass, padding)
//                                    me.cssNames[sizeClass] = true
//                                }
//                                var newImg = util.format('{{% img "%s" "%s" "%s" %}}', alt, fileNameShort, sizeClass)
//                                data = data.replace(oldImg, newImg)
//                                done(data);
//                            } else {
//                                console.error('Failed processing ' + filePath);
//                                done(data);
//                            }
//                        });
//                })
//                gmPromises.push(gmPromise)
//            } else {
//                console.warn('cannot process ' + fileUrl)
//                var match = /\/([^\/]+\.(png|gif))/.exec(fileUrl);
//                if (match && match[1]) {
//                    var fileName = match[1];
//                    data = data.replace(fileUrl, '/img/' + fileName)
//                } else {
//                    console.log('cannot fix URL ' + fileUrl)
//                }
//                gmPromises.push(new Promise(function (done) {
//                    done(data);
//                }));
//            }
//        })(next[0], next[1], next[2])
//    }
//    var gmPromiseAll = Promise.all(gmPromises);
//    return new Promise(function (done) {
//        gmPromiseAll.then(function () {
//            done(data);
//        });
//    });
//}
//
//ResponsiveImgs.prototype.saveLazyLoadCss = function (settings) {
//    return fs.writeFileAsync(path.join(settings.path.static.css, 'lazy-img.css'), this.css);
//}
//
//
