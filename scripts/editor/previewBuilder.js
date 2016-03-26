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

var readMetadata = require('../lib/get-post-data/process-metadata');
var processHtmlMore = require('../lib/get-post-data/generate-html-more');

var oldPostsPromise = fs.readFileAsync(settings.path.oldData, 'utf-8')
    .then(JSON.parse);

var buildPreviewSemaphor = Promise.promisifyAll(require('semaphore')(1));
var latestPost = null,
    latestContent;


exports.init = function () {

};

exports.buildPreview = function (post) {
    latestPost = post;
    var oldPosts;
    buildPreviewSemaphor.takeAsync(buildPreviewSemaphor)
        .then(function () {
            if (latestPost) {
                post = latestPost;
                return oldPostsPromise
                    .spread(function (_oldPosts) {
                        oldPosts = _oldPosts;
                        var data = collectInitialData(settings);
                        data.settings = settings;
                        data.target = post;
                        post.markdown = post.content;
                        return readMetadata(data)
                    })
                    .then(processHtmlMore)
            } else {
                return latestContent;
            }
        })
        .finally(function() {
            latestPost = null;
            buildPreviewSemaphor.leave();
        })
};