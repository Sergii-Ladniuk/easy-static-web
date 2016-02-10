var mainModule = require('./lib').module;
var fs = mainModule.fs;
var path = mainModule.path;
var script = {};
var util = require('util')
var responsiveImgs = new mainModule.ResponsiveImgs();

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

var imgUrlPattern = escapeRegExp('http://marinatravelblog.com/wp-content/uploads/');
var generalPattern = escapeRegExp('http://marinatravelblog.com')
var processImgPromiseAll = []

var WordpressFix = function () {
}

/**
 * replace more with link title
 * @param content md or html post
 * @returns {*} post with more changed to Hugo style
 */
WordpressFix.prototype.fixMore = function (content) {
    var moreMatch = content.match(/<!--more(.*)-->/);
    if (moreMatch && moreMatch.length == 2) {
        var moreLink = moreMatch[1];
        content = content.replace(moreMatch[0], '<!--more-->')
        content = content.replace('---', '---\nLinkTitle: \'' + moreLink + '\'');
    }
    return content;
}

require('./../settings.js').load
    .then(function (val) {
        script.settings = val
        script.categoriesPromise = fs.readFileAsync(script.settings.path.categories, "utf-8")
        script.postsPromise = fs.readFileAsync(script.settings.path.posts, "utf-8")
        return fs.readdirAsync(script.settings.path.wpContentFolder)
    })
    .each(function (fileName) {
        if (/\.md$/.test(fileName)) {
            const filePath = path.join(script.settings.path.wpContentFolder, fileName);
            return Promise.join(fs.readFileAsync(filePath, "utf-8"), script.postsPromise, script.categoriesPromise)
                .spread(function (content, posts, categories) {

                    // replace more with link title
                    var processImgPromise = responsiveImgs.replaceImgs(content, script.settings);

                    return new Promise(function (done) {
                        processImgPromise
                            .then(function (content) {
                                content = content;
                                content = content.replace('---', '---\nslug: \'' + fileName.match(/(.*).md$/)[1] + '\'');
                                content = content.replace(/(date:.+) (.+)/, '$1T$2');
                                content = content.replace(new RegExp(imgUrlPattern, 'g'), '');
                                content = content.replace(new RegExp(generalPattern, 'g'), '');
                                return content;
                            })
                            .then(function saveTemplate(content) {
                                const outputFilePath = path.join(script.settings.path.hugoPostFolder, fileName)
                                return fs.writeFileAsync(outputFilePath, content)
                            })
                            .then(done)
                    })


                    return processImgPromise;
                })
        } else {
            return null
        }
    })
    .each(function (fileName, content) {
        if (!/\.md$/.test(fileName)) {
            return null;
        }
    })
    .spread(function () {
        responsiveImgs.saveLazyLoadCss(script.settings)
    })
    .then(function () {
        console.log("done")
    })