var general = require('../lib/general');

var fs = general.fs;
var path = require('path');
var ncp = Promise.promisify(require('ncp').ncp);

var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));
var settings = require('../settings.js').loadSync();
var mm = require('../lib/get-post-data/meta-marked');

var os = require('os');
var newline = os.EOL;
var yaml = require('yamljs');

var posts;

exports.list = function () {
    if (posts) {
        return posts
    } else {
        return listContent()
            .map(function (file) {
                return loadPosts(file)
            }).then(function (_posts) {
                posts = _posts;

                posts.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });

                return posts;
            })
    }
};

exports.images = function () {
    return listImages()
        .map(function (file) {
            file = path.basename(file);
            return {
                name: file,
                url: 'http://localhost:4002/img/' + file
            }
        })
};

exports.save = function (post) {
    if (posts) {
        return savePost(post);
    } else {
        return loadPosts(file)
            .then(function () {
                savePost(post);
            })
    }
};

function savePost(post) {
    posts.forEach(function (cachedPost, index) {
        if (post.name === cachedPost.name) {
            if (post.content === cachedPost.content && JSON.stringify(post.meta) === JSON.stringify(cachedPost.meta)) {
                console.log('no change');
            } else {
                console.log('changed', index);
                posts[index] = post;
                post.meta.modifiedDate = new Date();

                var separator = '---';
                var metaYaml = yaml.stringify(post.meta, 4);
                var text = [separator, metaYaml, separator, post.content].join(newline)
                    .replace(/(modifiedDate[^]*?Z)/, '$1' + newline)
                    .replace(/(publishedDate[^]*?)\'([^]*?)\'/, '$1$2');

                var filePath = path.join(
                    (post.meta.draft ? settings.path.content_posts_drafts : settings.path.content_posts_published),
                    post.name);

                return fs.writeFileAsync(
                    filePath, text)
            }
        }
    })
}

function loadPosts(file) {
    return fs.readFileAsync(file, 'utf-8').then(function (text) {

        var parsedData = mm(text);

        return {
            name: path.basename(file),
            content: parsedData.markdown,
            meta: parsedData.meta
        }
    });
}

function listContent() {
    return general.util.listFiles(settings.path.content)
        .filter(function (file) {
            return path.extname(file) === '.md';
        });
}

function listImages() {
    return general.util.listFiles(settings.path.static.img)
        .filter(function (file) {
            return ['.jpg', '.png', '.gif'].indexOf(path.extname(file)) >= 0;
        });
}
