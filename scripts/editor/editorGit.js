var spawn = require('child-process-promise').spawn;
var settings = require('../settings').loadSync();
var util = require('util');
var previewBuilder = require('./previewBuilder');
var rest = require('./editorService');
var runProcesses = require('./runProcesses');

function bind(app) {
    app.post('/revert', function (req, res) {
        var cmds = [
            {
                cmd: 'git',
                args: ['checkout', 'HEAD', '-f']
            },
            {
                cmd: 'git',
                args: ['clean', '-f']
            }
        ];
        var result = runProcesses(cmds, settings.path.content);
        result
            .then(previewBuilder.buildPreview)
            .then(rest.loadContent);
        res.send(result)
    });

    app.post('/update-git', function (req, res) {
        var cmds = [
            {
                cmd: 'git',
                args: ['stash', 'save']
            },
            {
                cmd: 'git',
                args: ['pull', 'origin', 'master', '--rebase']
            },
            {
                cmd: 'git',
                args: ['stash', 'pop']
            }
        ];
        var result = runProcesses(cmds, settings.path.content);
        result
            .then(previewBuilder.buildPreview)
            .then(rest.loadContent);
        res.send(result)
    });

    app.post('/commit-git', function (req, res) {
        const msg = req.body;
        var cmds = [
            {
                cmd: 'git',
                args: ['add', '.']
            },
            {
                cmd: 'git',
                args: ['commit', '-m', msg]
            },
            {
                cmd: 'git',
                args: ['push', 'origin', 'master']
            }
        ];
        var result = runProcesses(cmds, settings.path.content);
        res.send(result)
    });
}


exports.bind = bind;
