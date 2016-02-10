var general = require('../general');

var fs = general.fs;
var path = require('path');
var util = require('util');
var extend = require('extend');

var renderWidget = require('./render-widget');

module.exports = function (data) {
    var settings = data.settings;
    var widgetsFolder = settings.path.widgets;

    function processWidgets(widgets, general) {
        return Promise.map(widgets, function (widget) {
            if (typeof widget === 'string') {
                return renderWidget(widget, general);
            } else {
                for (var complexWidgetName in widget) {
                    var childWidgets = widget[complexWidgetName];
                    return processWidgets(childWidgets, general)
                        .then(function (children) {
                            return renderWidget(complexWidgetName, general, children);
                        });
                }
            }
        }).reduce(function (a, b) {
            return extend(a, b);
        })
    }

    return fs.readFileAsync(path.join(widgetsFolder, 'widget.json'), "utf-8")
        .then(JSON.parse)
        .then(function (widgets) {
            data.widgetDesc = widgets;
            return processWidgets(widgets, data).then(function (widgets) {
                data.widgets = widgets;
                return data;
            });
        });
}