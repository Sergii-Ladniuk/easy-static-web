global.Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));
var util = require('util');
var os = require('os');
var path = require('path');

var translit = require('translitit-cyrillic-russian-to-latin');
var yaml = require('yamljs');
var slugify = require('uslug');
var parseArgs = require('minimist');

var argv = require('minimist')(process.argv.slice(2));

var general = require('./lib/general');

var newline = os.EOL;
var slugifyOptions = {allowedChars: '-'};

function listImgFolder(settings) {
    var imgFolder = settings.path.public.img;
    return general.util.listFiles(imgFolder);
}

function buildImgTags(imagePattern, settings, alt) {
    if (!alt) {
        alt = '';
    }
    var separator = newline + newline;
    if (imagePattern) {
        return Promise.all(listImgFolder(settings)
            .filter(function (img) {
                return new RegExp(imagePattern).test(img);
            })
            .map(function (img) {
                //![Кафайяте, курортный городок, дегустация вин](http://marinatravelblog.com/img/Cafayate-1015.jpg)
                return util.format('![%s](%simg/%s)', alt, settings.server.prod.url, img);
            }))
            .then(function (arr) {
                console.log(arr)
                return arr.join(separator);
            });
    } else {
        return '';
    }
}

function newPost(title, imagePattern, alt, type) {
    var type = type || 'post';
    var slug = slugify(translit(title), slugifyOptions);
    var me = {};
    return require('./settings.js').load
        .then(function (settings) {
            me.settings = settings;
            var promise = buildImgTags(imagePattern, settings, alt);

            var meta = {
                title: title,
                link: settings.server.prod.url + slug,
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
            me.metaYaml = yaml.stringify(meta, 4).replace('Zdraft:', newline + 'draft:');

            return promise;
        })
        .then(function (imgs) {
            var settings = me.settings;
            var content = imgs;
            var separator = '---';
            var metaYaml = me.metaYaml;
            var text = [separator, metaYaml, separator, content].join(newline);
            console.log('Template: \n\n', text);
            var outputPath = path.join(settings.path['content_' + type + 's' + '_drafts'], slug + '.md');
            console.log('\n\nOutput path: \n', outputPath);
            return fs.writeFileAsync(outputPath, text);
        })
        .then(function () {
            console.log('DONE.')
        })
}

module.exports = newPost;

if (argv.r) {
    newPost(argv.title, argv.img, argv.alt, argv.type);
}

