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

exports.runProcesses = runProcesses;
