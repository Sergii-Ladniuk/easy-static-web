var parseArgs = require('minimist');

var collectInitialData = require('./lib/collect-initial-data');
var getPostData = require('./lib/get-post-data');
var renderAll = require('./lib/render-all');
var benchmark = require('./lib/util/benchmarking');

var argv = require('minimist')(process.argv.slice(2));
var initialData;

exports.generate = function (args) {
    args = args || {};
    benchmark.start('generate');
    return require('./settings.js').load
        .then(function (settings) {
            console.log('generating...');
            if (!initialData) {
                var data = collectInitialData(settings);
                initialData = data;
                data.settings = settings;
                data.contentInMemory = args.contentInMemory;
            } else {
                data = initialData;
            }
            return getPostData(data)
        })
        .then(function (data) {
            var promise = renderAll(data);
            if (!promise.then) {
                throw new Error('renderAll no promise');
            }
            return promise;
        })
        .then(function () {
            benchmark.finish('generate');
            console.log('ALL DONE.');

            if (args.loop) {
                setTimeout(exports.generate, args.period || 2000)
            }
        });
};

if (argv.r) {
    exports.generate({
        loop: argv.l
    });
}
