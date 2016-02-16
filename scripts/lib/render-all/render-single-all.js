var renderPage = require('./render-page');
var saveContent = require('./save-content');

const renderSingleAll = function (data) {
    var promises = data.list
        .filter(function(content) { return content.meta.type === 'post'})
        .map(function (content) {
        var promise =  saveContent(data, renderPage(data, content, 'single.jade', content.meta), 0, content.meta.slug);
        if (!promise.then) {
            throw new Error('bad promise')
        }
        return promise;
    });
    console.log('promises '  + promises.length)
    return Promise.all(promises);
};

module.exports = renderSingleAll;