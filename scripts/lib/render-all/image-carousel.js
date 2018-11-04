require('../general');

function replaceImgWithCarousel(html, jadeTemplatePromise) {
    if (typeof jadeTemplatePromise.then !== 'function') {
        jadeTemplatePromise = new Promise((done) => done(jadeTemplatePromise));
    }
    return jadeTemplatePromise
        .then((jadeTemplate) => doReplaceImgWithCarousel(html, jadeTemplate));
}

function doReplaceImgWithCarousel(html, jadeTemplate) {
    let imgGroupRegexp = /(<p>[^<]*<div style="padding-bottom:[^>]*><img[^>]*>[\n ]*<\/div><\/p>[\n ]*){2,}/g;
    let tasks = [];
    let match;
    let index = 0;

    while (match = imgGroupRegexp.exec(html)) {
        let imgGroup = match[0];

        if (imgGroup) {
            let images = parseImages(imgGroup);

            if (images.length >= 2) {
                tasks.push({
                    initial: imgGroup,
                    updated: replaceOne(jadeTemplate, images, index++)
                });
            }
        }
    }

    return tasks;
}

function parseImages(imgGroup) {
    let images = [];
    let singleImgRegexp = /<img[^>]+?>/g;
    let singleImgMatch;

    while (singleImgMatch = singleImgRegexp.exec(imgGroup)) {
        let img = singleImgMatch[0];
        images.push(img);
    }
    return images;
}

function replaceOne(jadeTemplate, imgs, index) {
    return jadeTemplate({imgs, index});
}

exports.getReplaceImgWithCarouselTasks = replaceImgWithCarousel;