const responsiveImg = require('./responsive-imgs');
const imageCarousel = require('./image-carousel');

let progress = 0;

function reportProgress() {
    if (progress % 100 == 0)
        process.stdout.write(".");
    progress++;
}

function postProcessHtml(data, html) {
    return new Promise(function (postProcessDone) {
        var resultHtml = html;
        data.responsiveImgSettings
            .then(function (responsiveImgSettings) {
                var tasks = [];
                var imgRegex = /<img *(.*?)>/g;
                var srcRegex = /src *= *[\"\'](.*?)[\"\']/;
                var altRegex = /alt *= *[\"\'](.*?)[\"\']/;
                var titleRegex = /alt *= *[\"\'](.*?)[\"\']/;
                var sizeRegex = /data-size *= *[\"\'](.*?)[\"\']/;
                var match;
                while (match = imgRegex.exec(html)) {
                    var attrs = match[1];
                    let srcMatch = srcRegex.exec(attrs);
                    var src = srcMatch ? srcMatch[1] : null;
                    if (src && /local.marinatravelblog.com:4000/.test(src)) {
                        var sizeMatch = sizeRegex.exec(attrs);
                        var sizeClass = sizeMatch && sizeMatch[1] ? sizeMatch[1] : '';
                        var altMatch = altRegex.exec(attrs);
                        var alt = altMatch && altMatch[1] ? altMatch[1] : '';
                        var titleMatch = titleRegex.exec(title);
                        var title = titleMatch && titleMatch[1] ? titleMatch[1] : '';

                        (function (oldImgTag, src, alt, title) {
                            var promise = new Promise(function (done) {
                                responsiveImg.handleImg(data, src, alt, title, {
                                    lg: 800,
                                    md: 570,
                                    sm: 330
                                })
                                    .then(function (newImgTag) {
                                        if (newImgTag) {
                                            done({
                                                oldImgTag: oldImgTag,
                                                newImgTag: newImgTag
                                            });
                                        } else {
                                            done(false);
                                        }
                                    });
                            });
                            tasks.push(promise);
                        })(match[0], src, alt, title);
                    }
                }
                return tasks;
            })
            .each(function (toReplace) {
                reportProgress();
                if (toReplace) {
                    resultHtml = resultHtml.replace(toReplace.oldImgTag, toReplace.newImgTag);
                }
            })
            .then(function () {
                return imageCarousel.getReplaceImgWithCarouselTasks(resultHtml, data.jadeTemplates['carousel.jade']);
            })
            .each(function (toReplace) {
                if (toReplace) {
                    resultHtml = resultHtml.replace(toReplace.initial, toReplace.updated);
                }
            })
            .then(function () {
                postProcessDone(resultHtml)
            });
    });
}

function finalize() {

}

exports.postProcessHtml = postProcessHtml;
exports.finalize = finalize;