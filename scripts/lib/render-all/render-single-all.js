var renderPage = require('./render-page');
var saveContent = require('./save-content');
var sitemapRenderer = require('./render-sitemap');

const renderSingleAll = function (data) {
    var postIndex = 4;
    var promise = Promise.map(data.list
        .filter(function (content) {
            return content.meta.type === 'post'
        })
        .map(function (content) {
            postIndex++
            content.priority = Math.floor( 10 - postIndex / 2) / 10;
            if (content.priority < 0.3) {
                content.priority = 0.3;
            }
            return content;
        }),
        function (content) {
            var promise = saveContent(data, renderPage(data, content, 'single.jade', content.meta), 0, content.meta.slug);
            sitemapRenderer.add('http://marinatravelblog.com/' + content.meta.slug, 'monthly', content.priority);
            if (!promise.then) {
                throw new Error('bad promise')
            }
            promise.catch(function (err) {
                console.log('failed to save ', content.meta.title, err);
            })
            return promise;
        }, {concurrency: 2});
    return promise;
};

module.exports = renderSingleAll;