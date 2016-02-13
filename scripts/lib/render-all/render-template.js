function renderTemplate(name, data, content, meta) {
    if (content.then) {
        return content.then(function(content) {
            return renderTemplate(name, data, content, meta);
        })
    }
    return data.jadeTemplates[name].then(function (template) {
        var templateData = {
            data: data,
            widgets: data.widgets,
            content: content,
            meta: meta || {}
        };
        return template(templateData);
    })
}

module.exports = renderTemplate;