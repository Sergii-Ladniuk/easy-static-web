global.Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));
var util = require('util');
var os = require('os');
var path = require('path');

var yaml = require('yamljs');
var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));

var general = require('./lib/general');

var newline = os.EOL;

function listImgFolder(settings) {
    var imgFolder = settings.path.static.img;
    return general.util.listFiles(imgFolder);
}

function buildImgTags(imagePattern, settings, alt) {
    if (!alt) {
        alt = '';
    }
    var separator = newline + newline;
    if (imagePattern) {
        var imgPromises = listImgFolder(settings)
            .filter(function (img) {
                return new RegExp(imagePattern).test(img);
            })
            .map(function(img) {
                return path.basename(img);
            })
            .map(function (img) {
                //![Кафайяте, курортный городок, дегустация вин](http://marinatravelblog.com/img/Cafayate-1015.jpg)
                return util.format('![%s](%simg/%s)', alt, settings.server.prod.url, img);
            });
        return Promise.all(imgPromises)
            .then(function (arr) {
                return arr.join(separator);
            });
    } else {
        return '';
    }
}

function newPost(title, imagePattern, alt, type) {
    type = type || 'post';
    var slug = general.util.slugifyTranslit(title);
    var me = {};
    return require('./settings.js').load
        .then(function (settings) {
            me.settings = settings;
            return buildImgTags(imagePattern, settings, alt);
        })
        .then(function (imgs) {
            var meta = {
                title: title,
                link: me.settings.server.prod.url + slug,
                debug_link: 'http://localhost:4000/' + slug,
                slug: slug,
                // TODO verify all correct with the date
                date: new Date(),
                draft: true,
                type: type,
                categories: [],
                tags: [],
                seo: {
                    title: title,
                    description: '',
                    keywords: ["TODO: keywords here"]
                }
            };

            var settings = me.settings;

            var content = imgs;
            var separator = '---';
            var metaYaml = yaml.stringify(meta, 4).replace('Zdraft:', newline + 'draft:');
            var text = [separator, metaYaml, separator, content].join(newline);
            console.log('\n\nTemplate: \n\n', text);
            var outputPath = path.join(settings.path['content_' + type + 's' + '_drafts'], slug + '.md');
            console.log('\n\nOutput path: \n', outputPath);
            return fs.writeFileAsync(outputPath, text);
        })
        .then(function () {
            console.log('\n\nDONE.\n\n')
        })
}

module.exports = newPost;

if (argv.r) {
    newPost(argv.title, argv.img, argv.alt, argv.type);
}

