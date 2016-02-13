var renderTemplate = require('./render-template');

function renderPage(data, content, template, meta) {
    return renderTemplate(
        'wrapper.jade',
        data,
        renderTemplate(template, data, content, meta),
        meta
    );
}

module.exports = renderPage;