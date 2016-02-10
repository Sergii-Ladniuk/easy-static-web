function renderTemplate(name, data, content) {
    if (content.then) {
        return content.then(function(content) {
            return renderTemplate(name, data, content);
        })
    }
    return data.jadeTemplates[name].then(function (template) {
        var templateData = {
            data: data,
            widgets: data.widgets,
            content: content
        };
        return template(templateData);
    })
}

module.exports = renderTemplate;