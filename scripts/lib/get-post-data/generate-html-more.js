var marked = require('marked');
var toc = require('marked-toc');
var os = require('os');
var newline = os.EOL;
var moreRegex = /([^]*?)<!--more([^]*?)-->/;
var util = require('util');

var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[?:,| \/\\\!\#@%\^&\*\.\(\)]+/g, '-')
        .replace(/\-+$/, '');

    var result = util.format('<h%d id="%s">%s</h%d>', level, escapedText, text, level);

    return result;
};

function fixUrl(url) {
    return url.replace('http://marinatravelblog.com/', 'http://localhost:4000/');
}

renderer.image = function (href, title, alt) {
    href = fixUrl(href);
    var out = '<img src="' + href + '" alt="' + alt + '"';
    if (title) {
        out += ' title="' + title + '"';
    }
    out += this.options.xhtml ? '/>' : '>';
    return out;
};

renderer.link = function (href, title, text) {
    href = fixUrl(href);
    var out = '<a href="' + href + '"';
    if (title) {
        out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
};

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

    var tocTemplate = '<%= depth %><%= bullet %>[<%= heading %>](' + 'http://localhost:4000/' + post.meta.slug + '/#<%= url %>)\n';
    var table = '## Содержание ##' + newline
        + toc(post.markdown, {template: tocTemplate, bullet: ['1. ', '1. ', '1. ']});
    var tableHtml = util.format('<div class="toc">%s</div>', marked(table));

    post.html = marked(post.markdown, {renderer: renderer});

    parseMore(post, data.basic.settings);

    // replace [toc] with the table of contents
    post.html = post.html.replace(/\[ *?toc *?\]/g, tableHtml).replace(/<!-- *?toc *?-->/g, tableHtml);

    // skip toc in the post summary
    post.summary = post.summary.replace(/\[ *?toc *?\]/g, '');


    delete post.markdown;
    return data;
};