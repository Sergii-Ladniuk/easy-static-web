var renderTemplate = require('./render-template');

function renderPage(data, content, template) {
    return renderTemplate(
        'wrapper.jade',
        data,
        renderTemplate(template, data, content)
    );
}

module.exports = renderPage;