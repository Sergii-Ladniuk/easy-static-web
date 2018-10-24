let node_ssh = require('node-ssh');

class SshUtil {
    constructor(settings) {
        this.ssh = new node_ssh();
        this.connected = this.ssh
            .connect(settings.deploy.ssh);
    }

    cleanup() {
        this.ssh.end();
    }

    listFiles(dir) {
        return this.connected.then(_ => __listFiles.bind(this)(dir));
    }

    upload(srcPath, dstPath) {
        return this.connected.then(_ => __upload.bind(this)(srcPath, dstPath));
    }
}

function __listFiles(dir) {
    return this.ssh
        .execCommand(
            'ls',
            {
                cwd: '/home/marinatr/public_html/wp-content/uploads/', stream: 'both'
            })
        .then(function (result) {
            if (result.stderr) {
                console.warn('STDERR: ' + result.stderr);
                throw new Error(result.stderr);
            }
            return result.stdout.split('\n');
        });
}

function __upload(srcPath, dstPath) {
    return this.ssh.put(srcPath, dstPath);
}

module.exports = SshUtil;