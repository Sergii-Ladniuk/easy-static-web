var renderTemplate = require('./render-template');

function renderPage(data, content, template, meta, paging) {
    return renderTemplate(
        'wrapper.jade',
        data,
        renderTemplate(template, data, content, meta, paging),
        meta
    );
}

module.exports = renderPage;