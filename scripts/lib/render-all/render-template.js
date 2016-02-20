function renderTemplate(name, data, content, meta, paging) {
    if (content.then) {
        return content.then(function(content) {
            return renderTemplate(name, data, content, meta,paging);
        })
    }
    return data.jadeTemplates[name].then(function (template) {
        var templateData = {
            data: data,
            widgets: data.widgets,
            content: content,
            meta: meta || {},
            paging: paging
        };
        return template(templateData);
    })
}

module.exports = renderTemplate;