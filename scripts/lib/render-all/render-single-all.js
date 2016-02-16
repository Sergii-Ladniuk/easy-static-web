var renderPage = require('./render-page');
var saveContent = require('./save-content');

const renderSingleAll = function (data) {
    var promise = Promise.map(data.list
        .filter(function (content) {
            return content.meta.type === 'post'
        }),
        function (content) {
            console.log('save ', content.meta.title);
            var promise = saveContent(data, renderPage(data, content, 'single.jade', content.meta), 0, content.meta.slug);
            if (!promise.then) {
                throw new Error('bad promise')
            }
            promise.catch(function(err) {
                console.log('failed to save ', content.meta.title, err);
            })
            return promise;
        }, {concurrency: 2});
    return promise;
};

module.exports = renderSingleAll;