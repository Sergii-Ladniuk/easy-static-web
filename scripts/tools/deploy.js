var node_ssh = require('node-ssh'),
    ssh = new node_ssh();
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));
var run = argv.r || argv.run;
var settings = require('../settings').loadSync();
var Git = require("nodegit");


var deploy = module.exports = function () {
    commitAndPush();
    updateRemoteServer();
};

if (run) {
    deploy();
}

function updateRemoteServer() {
    ssh.connect(settings.deploy.ssh)
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

function commitAndPush() {
    var folder = settings.path.public_prod._;

    var cmds = [
        {cmd: 'cd', args:[folder]},
        {cmd: 'git', args: ['add', '.']},
        {cmd: 'git', args: ['commit', '-m', '"update"']},
        {cmd: 'git', args: ['push', 'origin', 'master']}
    ];

    var spawn = require('child-process-promise').spawn;


    Promise.each(cmds, function(cmd) {
        console.log('exec:', cmd);
        return spawn(cmd.cmd, cmd.args, {capture: ['stdout', 'stderr']})
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
}

