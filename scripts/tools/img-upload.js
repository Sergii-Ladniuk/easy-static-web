let parseArgs = require('minimist');
let argv = parseArgs(process.argv.slice(2));
let path = require('path');
let general = require('../lib/general');
let fs = general.fs;
let SshUtil = require('./ssh-util');

class ImageUploader {
    constructor(settings) {
        this.settings = settings;
    }

    uploadImgs() {
        let ssh = new SshUtil(this.settings);
        let remoteImgsPromise = ssh.listFiles(this.settings.deploy.imgDir);
        let localImgsPromise = general.util.listFiles(this.settings.path.public.img)
            .map(getFileName)
            .filter(f => !f.startsWith('.'))
            .then(list => {
                return list;
            });

        return Promise.join(localImgsPromise, remoteImgsPromise)
            .spread(listSubtract)
            .each(img => uploadImg.bind(this)(img, ssh))
            .finally(ssh.cleanup.bind(ssh))
    }
}

function uploadImg(img, ssh) {
    let srcPath = path.join(this.settings.path.public.img, img);
    let dstPath = path.join(this.settings.deploy.imgDir, img);
    return ssh.upload(srcPath, dstPath);
}

function listSubtract(a, b) {
    return a.filter(x => !b.includes(x));
}

function getFileName(filePath) {
    return path.parse(filePath).base;
}

module.exports = ImageUploader;

if (argv.run) {
    let settings = require('../settings').loadSync();
    let imageUploader = new ImageUploader(settings);
    imageUploader.uploadImgs();
}