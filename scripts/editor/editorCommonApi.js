var path = require('path');

var rest = require('./editorService');
var storage = require('../lib/render-all/html-storage');
var previewBuilder = require('./previewBuilder');
var newPost = require('../new-post');
var runProcesses = require('./runProcesses');

const settings = require('../settings').loadSync();
const PostPublishService = require('../tools/publish-post');

function bind(app) {
    app.get('/list', function (req, res) {
        var list = rest.list();
        res.send(list)
    });

    app.get('/images', function (req, res) {
        rest.images().then(function (list) {
            res.send(list)
        })
    });

    app.post('/post', function (req, res) {
        const post = req.body;
        console.log('save', post.meta.title);
        if (post) {
            rest.save(post)
                .then(function (changed) {
                    if (changed) {
                        console.log('build preview');
                        return previewBuilder.buildPreview(post).then(function () {
                            console.log('build preview done.')
                        });
                    }
                })
                .then(function () {
                    res.send('ok');
                })
        } else {
            res.send('')
        }
    });

    app.post('/publish', function(req,res) {
        const post = req.body;
        const publishDraft = req.query.publishDraft;

        const postPublishService = new PostPublishService(settings);

        let promise;

        if (post.meta.draft && publishDraft) {
            promise = postPublishService.publish(post.meta.slug);
        } else {
            promise = postPublishService.runDeploy();
        }

        promise
            .then(out => {
                console.log(out);
                return res.status(200).send(out);
            })
            .catch(err => {
                console.log(err);
                return res.status(500).send(err);
            });
    });

    app.get('/preview/:post', function (req, res) {
        var name = req.params.post;
        var html = (storage.htmls[name] || storage.htmls[path.join(name, 'index.html')])
            .replace(/-sm\.jpg/g, '.jpg')
        res.send(html);
    });

    var newPostHandler = function (type) {
        return function(req,res) {
            var title = req.body.title;
            console.log('title', title);
            var fileName;

            newPost(title, type)
                .then(function(_fileName) {
                    fileName = _fileName
                })
                .then(rest.loadContent)
                .then(previewBuilder.buildPreview)
                .then(function() {
                    res.send(fileName)
                })
        };
    };
    app.post('/new-post', newPostHandler('post'));
    app.post('/new-page', newPostHandler('page'));
}

exports.bind = bind;