var renderPage = require('./render-page');
var saveContent = require('./save-content');

const renderSingleAll = function (data) {
    return Promise.all(
        Promise.map(data.list, function (content) {
            return saveContent(data, renderPage(data, content, 'single.jade', content.meta), 0, content.meta.slug);
        })
    );
};

module.exports = renderSingleAll;