var general = require('../lib/general');

var fs = general.fs;
var path = require('path');
var ncp = Promise.promisify(require('ncp').ncp);

var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));
var copyTo = argv.dest;
var settings;

function listImgs() {
    return general.util.listFiles(settings.path.public.img);
}

require('../settings.js').load
    .then(function(v) {
        settings = v;
    })
    .then(listImgs)
    .filter(function(file) {
        return !/-md\./.test(file) && !/-sm\./.test(file);
    })
    .then(function(files) {
        return Promise.map(files, function(file){
            var name = path.basename(file);
            var dest = path.join(copyTo, name);
            return ncp(file, dest);
        }, {concurrency: 5});
    })
