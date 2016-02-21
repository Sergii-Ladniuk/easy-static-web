var general = require('../lib/general');

var fs = general.fs;
var path = require('path');
var ncp = Promise.promisify(require('ncp').ncp);

var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));
var target = argv.t || argv.target;
var settings;

var patches = [
    {
        name: 'youtube',
        transform: function (content) {
            return content.replace(/\[embed](.*?)\[\/embed\][^]*?\[.*?\][^]*?\([^]*?\)/g, '[youtube src="$1"]');
        }
    },
    {
        name: 'captions',
        transform: function (content) {
            var newline = require('os').EOL;
            return content
                .replace(/\[caption.*?\](.*?\)) *(.*?) *\[\/caption\]/g, '$1' + newline + '_$2_' + newline)
                .replace(/\[[\/]?caption.*?\]/g, '');
        }
    }
];

function applyPatches(content) {
    patches.forEach(function (patch) {
        if (target === patch.name || target === 'all') {
            content = patch.transform(content);
        }
    });
    return content;
}


function listContent() {
    return general.util.listFiles(settings.path.content)
        .filter(function (file) {
            return path.extname(file) === '.md';
        });
}

require('../settings.js').load
    .then(function (v) {
        settings = v;
    })
    .then(function () {
        Promise.map(
            listContent(),
            function (file) {
                return fs.readFileAsync(file, 'utf-8')
                    .then(function (content) {
                        var contentUpdated = applyPatches(content);
                        return fs.writeFileAsync(file, contentUpdated);
                    })
            },
            {concurrency: 5})
            .then(function () {
                console.log('done');
            })
    });