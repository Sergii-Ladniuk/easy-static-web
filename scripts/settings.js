global.Promise = require('bluebird');

const path = require('path');
const fs = Promise.promisifyAll(require('fs'))

exports.load = new Promise(function (resolve, reject) {
    if (exports.settings) {
        resolve(exports.settings)
    }

    var settingsPath = __dirname + '/../settings.json';
    fs.readFileAsync(settingsPath, 'utf-8')
        .then(function (data) {
            try {
                exports.settings = JSON.parse(data)
                exports.settings.url = exports.settings["server-url-test"]

                exports.settings.path.wpContentFolder = exports.settings.path.blog + "/content_from_wp"

                // temporary fpr hugo
                exports.settings.path.publicFolder = path.join(exports.settings.path.blog, "/public/")
                // new approach
                exports.settings.path.public = path.join(exports.settings.path.blog, "/public-debug/")
                exports.settings.path.pagesFolder = path.join(exports.settings.path.blog, "/public/page/")

                exports.settings.path.source = {_: path.join(exports.settings.path.blog, "source")}
                exports.settings.path.source.img = path.join(exports.settings.path.source._, "img")
                exports.settings.path.static = {_: path.join(exports.settings.path.blog, "static")}
                exports.settings.path.static.img = path.join(exports.settings.path.static._, "img")
                exports.settings.path.wpImg = path.join(exports.settings.path.blog, "zz_img_processed/img/")
                exports.settings.path.static.css = path.join(exports.settings.path.static._, "css")

                exports.settings.path.oldImgs = exports.settings.path.blog + "/zz_all_wp_img_bk"
                exports.settings.path.hugoContentFolder = exports.settings.path.blog + "content"

                exports.settings.path.content = path.join(exports.settings.path.blog, "content")
                exports.settings.path.content_posts = path.join(exports.settings.path.content, "posts")
                exports.settings.path.content_posts_drafts = path.join(exports.settings.path.content_posts, "drafts")
                exports.settings.path.content_posts_published = path.join(exports.settings.path.content_posts, "published")
                exports.settings.path.content_pages = path.join(exports.settings.path.content, "pages")
                exports.settings.path.content_pages_drafts = path.join(exports.settings.path.content_pages, "drafts")
                exports.settings.path.content_pages_published = path.join(exports.settings.path.content_pages, "published")

                exports.settings.path.tags = exports.settings.path.content + "/tags.json"
                exports.settings.path.categories = exports.settings.path.content + "/categories.json"
                exports.settings.path.featuredText = exports.settings.path.content + "/featured-text.json"
                exports.settings.path.posts = exports.settings.path.content + "/posts.json"

                exports.settings.path.wpXml = exports.settings.path.blog + "/import/"
                exports.settings.path.wpJson = exports.settings.path.wpXml + "/wpJson.json"


                exports.settings.path.hugoPostFolder = exports.settings.path.hugoContentFolder + "/post/"
                exports.settings.path.menuTemplate = exports.settings.path.blog + "/themes/travel/layouts/partials/navbar.html"

                exports.settings.path.layouts = path.join(exports.settings.path.blog, "/layouts/")
                exports.settings.path.widgets = path.join(exports.settings.path.layouts, "/widgets/")
            } catch (e) {
                console.error("invalid json in file" + settingsPath);
                reject(e)
            }
            resolve(exports.settings)
        })
        .catch(function (e) {
            console.error("Unable to the main settings file" + settingsPath);
            throw e;
        });
})