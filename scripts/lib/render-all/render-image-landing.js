//http://marinatravelblog.com/peru-poxod-uajuash-huayhuash/poxod-uajuash-peru-36/
var path = require('path');
var renderPage = require('./render-page');
var saveContent = require('./save-content');
var sitemapRenderer = require('./render-sitemap');

var renderImageLandings = module.exports = function (data) {
    return Promise.map(data.list,
        function (post) {
            var promise = Promise.map(post.images,
                function (img) {
                    img.more = post.more;
                    img.postLink = post.meta.link;
                    img.folder = post.meta.slug + '/' + path.parse(img.src).name;
                    img.landingUrl = 'http://local.marinatravelblog.com:4000/'+img.folder;
                    var promise =
                        saveContent(
                            data,
                            renderPage(data, img, 'img-landing.jade', post.meta),
                            0,
                            img.folder);
                    return promise;
                });
            promise.then(function() {
                delete post.images;
            })
            return promise;
        },
        {concurrency: 2});
};