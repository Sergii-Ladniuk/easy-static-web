const mainModule = require('../../general.js');
const path = require('path');
const fs = mainModule.fs;
const gm = mainModule.gm;
const util = require('util');

var ResponsiveImgs = function () {
    this.css = "";
    this.cssNames = {}
};

/**
 * Replaces md image tags with div/noscript for responsive images
 * @returns {Array} array
 */
ResponsiveImgs.prototype.replaceImgs = function (data, settings) {
    // replace img notations with shortcodes http://gohugo.io/extras/shortcodes/
    // ![Баньос, Тунгурауа, Эквадор](http://localhost:4000/img/Banos-Tingurahua-Ecuador-3.jpg)
    // ==>
    // {{% img "Баньос, Тунгурауа, Эквадор" "http://localhost:4000/img/Banos-Tingurahua-Ecuador-3.jpg" %}}

    var imgRegex = /!\[([^\(]+)]\(([^\)]+)\)/g;
    var next
    var gmPromises = []
    var me = this;
    while (next = imgRegex.exec(data)) {
        (function (oldImg, alt, fileUrl) {
            // todo not only jpg ?
            var match = /\/([^\/]+)\.jpg/.exec(fileUrl);
            if (match && match.length === 2) {
                var fileName = match[1] + '-lg.jpg';
                var fileNameShort = match[1];
                var gmPromise = new Promise(function (done, reject) {
                    //FIXME
                    var filePath = path.join(settings.path.wpImg, fileName);
                    gm(filePath)
                        .size(function (err, size) {
                            if (!err) {
                                var padding = Math.floor(size.height / size.width * 100 + 0.1) + 1;
                                var sizeClass = util.format('p%d', padding);
                                if (!me.cssNames[sizeClass]) {
                                    me.css += util.format('.%s{ padding-bottom:%d%%;}', sizeClass, padding)
                                    me.cssNames[sizeClass] = true
                                }
                                var newImg = util.format('{{% img "%s" "%s" "%s" %}}', alt, fileNameShort, sizeClass)
                                data = data.replace(oldImg, newImg)
                                done(data);
                            } else {
                                console.error('Failed processing ' + filePath);
                                done(data);
                            }
                        });
                })
                gmPromises.push(gmPromise)
            } else {
                console.warn('cannot process ' + fileUrl)
                var match = /\/([^\/]+\.(png|gif))/.exec(fileUrl);
                if (match && match[1]) {
                    var fileName = match[1];
                    data = data.replace(fileUrl, '/img/' + fileName)
                } else {
                    console.log('cannot fix URL ' + fileUrl)
                }
                gmPromises.push(new Promise(function(done){
                    done(data);
                }));
            }
        })(next[0], next[1], next[2])
    }
    var gmPromiseAll = Promise.all(gmPromises);
    return new Promise(function (done) {
        gmPromiseAll.then(function () {
            done(data);
        });
    });
}

ResponsiveImgs.prototype.saveLazyLoadCss = function (settings) {
    return fs.writeFileAsync(path.join(settings.path.static.css, 'lazy-img.css'), this.css);
}

module.exports = ResponsiveImgs