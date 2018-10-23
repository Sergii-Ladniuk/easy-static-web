var extend = require('extend');
var jade = require('jade');
var path = require('path');


var renderWidget = function (name, data, children) {
    try {
        var settings = data.settings;
        var widgetsFolder = settings.path.widgets;

        var ext = path.extname(name);

        var html;

        return data.jadeTemplates[name].then(function (widgetTemplate) {
            if (ext === '.jade') {
                var dataCopy = extend({
                    widgets: children,
                    year: new Date().getFullYear()
                }, data);
                html = widgetTemplate(dataCopy);
            } else {
                html = widgetTemplate;
            }

            var widgets = children || {};

            name = path.parse(name).name;

            widgets[name] = html;

            return widgets;
        });
    } catch (err) {
        err.message = 'Error while rendering widget ' + name + " " + err.message;
        throw err;
    }
};

module.exports = renderWidget;