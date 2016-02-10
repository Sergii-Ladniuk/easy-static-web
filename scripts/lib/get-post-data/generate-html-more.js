var marked = require('marked');
var moreRegex = /([^]*?)<!--more([^]*?)-->/;

var parseMore = function (post, settings) {
    var match = moreRegex.exec(post.html);
    if (match && match[2]) {
        post.summary = match[1];
        post.more = match[2];
        post.html = post.html.replace(/<!--more[^]*?-->/, '')
    } else {
        // TODO more limit
        var msg = 'No more tag in the post ' + post.meta.slug;
        if (!post['skip-more'] && !post.meta.draft &&
            settings.generate['mandatory-more']
            || settings.generate['mandatory-more-limit']
            && settings.generate['mandatory-more-limit'] < post.markdown.length) {
            throw new Error(msg)
        }
        else {
            console.warn(msg)
        }
        post.summary = post.html;
    }
}

module.exports = function (data) {
    var post = data.target;
    post.html = marked(post.markdown);
    parseMore(post, data.basic.settings);
    delete post.markdown;
    return data;
};