var renderTemplate = require('./render-template');
var saveContent = require('./save-content');
var sm = require('sitemap');

var urls = [];

exports.render = function (data) {
    var sitemap = sm.createSitemap({
        hostname: 'https://marinatravelblog.com',
        cacheTime: 600,        // 600 sec - cache purge period
        urls: urls
    });
    //return Promise.promisify(sitemap.toXML) ()
    //    .then(function(xml) {
    return saveContent(data, sitemap.toString(), 0, null, 'xml', 'sitemap');
        //})
};

exports.add = function (url, changefreq, priority) {
    urls.push(
        {
            url: url,
            changefreq: changefreq,
            priority: priority
        });
};