var collectInitialData = require('./lib/collect-initial-data')
var getPostData = require('./lib/get-post-data')
var renderAll = require('./lib/render-all')
var parseArgs = require('minimist');
var argv = require('minimist')(process.argv.slice(2));

exports.generate = function () {
    return require('./settings.js').load
        .then(function (settings) {
            console.log('generating...')
            var data = collectInitialData(settings);
            data.settings = settings;
            return getPostData(data)
                .then(renderAll)
                .then(function () {
                    console.log('DONE.')
                });
        })
};

if (argv.r) {
    exports.generate();
}
