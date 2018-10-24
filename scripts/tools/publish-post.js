let parseArgs = require('minimist');
let argv = parseArgs(process.argv.slice(2));
let path = require('path');
let yaml = require('yamljs');
let metamarked = require('../lib/get-post-data/meta-marked');
let general = require('../lib/general');
let fs = general.fs;
let os = require('os');
let newline = os.EOL;
let exec = require('child_process').exec;

class PostPublishService {

    constructor(settings) {
        this.settings = settings;
    }

    publish(postName) {
        let post = this.readPost(postName);
        return this.updatePostContent(post)
            .then(this.runDeploy.bind(this));
    }

    updatePostContent(postPromise) {
        return postPromise
            .then(this.modifyPostMeta.bind(this))
            .then(this.savePost.bind(this))
            .then(this.deleteDraft.bind(this))
    }

    modifyPostMeta(post) {
        let meta = post.meta;
        delete meta.draft;
        meta.modifiedDate = meta.publishedDate = new Date().toISOString();
        return post;
    }

    readPost(postName) {
        let draftPath = this.getDraftPath(postName);
        return fs.readFileAsync(draftPath, "utf-8")
            .then((content) => {
                let post = metamarked(content);
                post.postName = postName;
                return post;
            })
    }

    getDraftPath(postName) {
        let draftFolder = this.settings.path.content_posts_drafts;
        return path.join(draftFolder, postName + '.md');
    }

    deleteDraft(post) {
        let draftPath = this.getDraftPath(post.postName);
        return fs.unlinkAsync(draftPath);
    }

    savePost(post) {
        let publishedFolder = this.settings.path.content_posts_published;
        let publishedPath = path.join(publishedFolder, post.postName + '.md');
        return fs.writeFileAsync(publishedPath, this.stringifyPost(post))
            .then(_ => post);
    }

    stringifyPost(post) {
        let separator = '---';
        let metaYaml = yaml.stringify(post.meta, 4);
        return [separator, metaYaml, separator, post.markdown].join(newline);
    }

    runDeploy() {
        return new Promise((done, fail) => {
            exec('grunt publish-deploy',
                {cwd: this.settings.path.blog},
                (error, stdout, stderr) => {
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                        fail(error);
                    }
                    done(`Output: ${stdout} \n<br>\nErrors: ${stderr}\n<br>\n`);
                });
        });
    }
}

exports = PostPublishService;

if (argv.run) {
    let post = argv.post;
    let settings = require('../settings').loadSync();

    pps = new PostPublishService(settings);
    pps.publish(post).then(console.log);
}