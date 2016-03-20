var node_ssh = require('node-ssh'),
    ssh = new node_ssh();
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));
var run = argv.r || argv.run;
var msg = argv.m || argv.msg;
var settings = require('../settings').loadSync();
var Git = require("nodegit");


var deploy = module.exports = function (msg) {
    msg = msg || 'update';
    return commitAndPush(msg).then(function () {
        return updateRemoteServer();
    });
};

if (run) {
    deploy(msg);
}

function updateRemoteServer() {
    return ssh.connect(settings.deploy.ssh)
        .then(function () {
            return ssh.execCommand(
                'git pull origin master',
                {
                    cwd: '/home/marinatr/public_html', stream: 'both'
                })
        })
        .then(function (result) {
            console.warn('STDERR: ' + result.stderr);
            console.log('STDOUT: ' + result.stdout);
            return ssh.end();
        })
        .then(function () {
            console.log('connection closed.')
        });
}

function commitAndPush(msg) {

    var folders = [
        settings.path.public_prod._,
        settings.path.content,
        settings.path.blog
    ];

    return Promise.map(folders, function (folder) {

        var cmds = [
            {cmd: 'cd', args: [folder]},
            {cmd: 'git', args: ['add', '.']},
            {cmd: 'git', args: ['commit', '-m', '"' + msg + '"']},
            {cmd: 'git', args: ['push', 'origin', 'master']}
        ];

        var spawn = require('child-process-promise').spawn;


        return Promise.each(cmds, function (cmd) {
            console.log('exec:', cmd);
            return spawn(cmd.cmd, cmd.args, {capture: ['stdout', 'stderr'], cwd: folder})
                .then(function (result) {
                    if (result.stdout)
                        console.log('[spawn] stdout: ', result.stdout.toString());
                    if (result.stderr)
                        console.warn('[spawn] stderr: ', result.stderr);
                })
                .fail(function (err) {
                    console.log('error', err);
                    if (err) {
                        console.error('[spawn] stderr: ', err.stderr);
                    }
                });
        });
    }, {concurrency: 1});
}

