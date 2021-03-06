var general = require('../general');
var marked = require('marked');
var toc = require('marked-toc');
var os = require('os');
var newline = os.EOL;
var moreRegex = /([^]*?)<!--more([^]*?)-->/;
var util = require('util');

var respImgs = require('../render-all/responsive-imgs');

let EmbedService = require('./process-embeds');

function renderer(data) {
    var settings = data.basic.settings;
    var renderer = new marked.Renderer();
    var post = data.target;

    renderer.heading = function (text, level) {
        // todo use some slugify impl.
        var escapedText = text.toLowerCase()
            .replace(/<a.*?>(.*?)<\/a>/, '$1')
            .replace(/[?:,| \/\\\!\#@%\^&\*\.\(\)]+/g, '-')
            .replace(/\-+$/, '')
            .replace(/^\-+/, '');

        var result = util.format('<h%d id="%s">%s</h%d>', level, escapedText, text, level);

        return result;
    };

    function fixUrl(url) {
        return url
            .replace('http://localhost:4000/', 'http://localhost:4000/')
            .replace(settings.server.prod.url, 'http://localhost:4000/');
    }

    function isHomeUrl(url) {
        return new RegExp(general.util.escapeRegExp(settings.server.prod.url)).test(url)
            || new RegExp(general.util.escapeRegExp('http://localhost:4000')).test(url);
    }

    var currentImg, prevImg;

    renderer.image = function (href, title, alt) {
        href = fixUrl(href);

        if (!this.firstImage) {
            this.firstImage = href;
        }

        currentImg = {
            src: href,
            alt: alt,
            title: title,
            previous: prevImg
        };

        post.images.push(currentImg);
        if (prevImg) {
            prevImg.next = currentImg;
        }
        prevImg = currentImg;

        var out = '<img src="' + href + '" alt="' + alt + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';

        return out;
    };

    renderer.link = function (href, title, text) {
        if ((href.includes('youtube') || href.includes('youtu.be')
                || href.includes('google.com/maps')
                || href.includes('dailymotion.com')) && href === text) {
            return href;
        }

        href = fixUrl(href);

        if (!/\/$/.test(href) && /localhost/.test(href))
            href = href + '/';

        var out = '<a href="' + href + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += ' target="_blank" ';
        out += '>' + text + '</a>';
        return out;
    };

    return renderer;
}


var parseMore = function (post, settings) {
    var match = moreRegex.exec(post.html);
    if (match && match[2]) {
        post.summary = match[1];
        post.more = match[2];
        post.html = post.html.replace(/<!--more[^]*?-->/, '')
    } else {
        // TODO more limit
        var msg = 'No more tag in the post ' + post.meta.slug;
        if (!post.meta['no-more']) {
            if (!post.meta.draft
                && (settings.generate['mandatory-more']
                    || settings.generate['mandatory-more-limit']
                    && settings.generate['mandatory-more-limit'] < post.markdown.length)) {
                throw new Error(msg)
            }
            else {
                console.warn(msg);
            }
        }
        post.summary = post.html;
    }
}

module.exports = function (data) {

    return handleEmbeds(data)
        .then(function () {
            var post = data.target;
            var tocTemplate = '<%= depth %><%= bullet %>[<%= heading %>](' + 'http://localhost:4000/' + post.meta.slug + '/#<%= url %>)\n';
            var table = '## Содержание ##' + newline
                + toc(post.markdown, {template: tocTemplate, bullet: ['1. ', '1. ', '1. ']});
            var tableHtml = util.format('<div class="toc">%s</div>', marked(table));

            post.images = post.images || [];

            var rendererObj = renderer(data);
            post.html = marked(post.markdown, {renderer: rendererObj});

            post.meta.img = rendererObj.firstImage;

            parseMore(post, data.basic.settings);

            // replace [toc] with the table of contents
            post.html = post.html.replace(/\[ *?toc *?\]/g, tableHtml).replace(/<!-- *?toc *?-->/g, tableHtml);

            // skip toc in the post summary
            post.summary = post.summary.replace(/\[ *?toc *?\]/g, '');

            return data;
        })
};

function handleEmbeds(data) {
    let post = data.target;
    let text = post.markdown;
    let replace = (src, dst) => post.markdown = post.markdown.replace(src, dst);

    return processEmbeds(data, text, replace);
}

function processEmbeds(data, text, replace) {
    // do nothings, embeds are processed after rendering
    return Promise.resolve(data);
}
