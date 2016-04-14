var spawn = require('child-process-promise').spawn;
var settings = require('../settings').loadSync();
var util = require('util');
var previewBuilder = require('./previewBuilder');
var rest = require('./editorService');

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

function runProcesses(cmds, folder) {
    var out = '';
    return Promise.each(cmds, function (cmd) {
            const cmdOut = util.format('> [%s] %s %s', folder, cmd.cmd, cmd.args.join(' '));
            out += cmdOut + '\n';
            console.log(cmdOut);
            return spawn(cmd.cmd, cmd.args, {capture: ['stdout', 'stderr'], cwd: cmd.folder || folder})
                .then(function (result) {
                    if (result.stdout) {
                        out += result.stdout.toString() + '\n';
                        console.log(result.stdout.toString());
                    }
                    if (result.stderr) {
                        out += result.stderr.toString() + '\n';
                        console.warn(result.stderr.toString());
                    }
                })
        }, {concurrency: 1})
        .then(function () {
            return out;
        })
        .catch(function (err) {
            console.log('error', err);
            out += '\n' + err.stdout + '\n' + err.stderr;
            return out;
        });
}

exports.bind = bind;