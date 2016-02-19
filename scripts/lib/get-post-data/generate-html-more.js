var general = require('../general');
var marked = require('marked');
var toc = require('marked-toc');
var os = require('os');
var newline = os.EOL;
var moreRegex = /([^]*?)<!--more([^]*?)-->/;
var util = require('util');

var respImgs = require('../render-all/responsive-imgs');

function renderer(data) {
    var settings = data.basic.settings;
    var renderer = new marked.Renderer();

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
        return url.replace(settings.server.prod.url, 'http://localhost:4000/');
    }

    function isHomeUrl(url) {
        return new RegExp(general.util.escapeRegExp(settings.server.prod.url)).test(url);
    }


    renderer.image = function (href, title, alt) {
        href = fixUrl(href);

        if (!this.firstImage) {
            this.firstImage = href;
        }

        var out = '<img src="' + href + '" alt="' + alt + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';

        return out;
    };

    function doFollow(url) {
        return settings.generate['do-follow'].map(function (pattern) {
            return new RegExp(general.util.escapeRegExp(pattern)).test(url)
        }).reduce(function (a, b) {
            return a || b;
        })
    }

    renderer.link = function (href, title, text) {
        var nofollow = '';
        if (!isHomeUrl(href) && !doFollow(href)) {
            nofollow = ' rel="nofollow" '
        }

        href = fixUrl(href);
        var out = '<a href="' + href + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += nofollow;
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

    return handleEmbeds(data)
        .then(function () {
            var post = data.target;
            var tocTemplate = '<%= depth %><%= bullet %>[<%= heading %>](' + 'http://localhost:4000/' + post.meta.slug + '/#<%= url %>)\n';
            var table = '## Содержание ##' + newline
                + toc(post.markdown, {template: tocTemplate, bullet: ['1. ', '1. ', '1. ']});
            var tableHtml = util.format('<div class="toc">%s</div>', marked(table));

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
    return data.basic.renderBlockingPromise.then(function (promises) {
            return promises.embedTemplates;
        })
        .then(function (embed) {
            var post = data.target;
            var toReplace = [];
            var tasks = [];
            embed.forEach(function (templateDef) {
                var match;
                while (match = templateDef.regexp.exec(post.markdown)) {
                    var item = match[0];
                    var attrsRaw = match[1];

                    var attrRegex = /(.*)?=\"(.*?)\"/g;
                    var attrMatch;
                    var attrs = {};
                    while (attrMatch = attrRegex.exec(attrsRaw)) {
                        var name = attrMatch[1];
                        var val = attrMatch[2];
                        attrs[name] = val;
                    }

                    var nextReplacement = templateDef.template.then(function (template) {
                        return {
                            src: item,
                            dest: template(attrs)
                        };
                    });
                    toReplace.push(nextReplacement);
                }
                var promise = Promise.map(toReplace, function (next) {
                    post.markdown = post.markdown.replace(next.src, next.dest);
                });
                tasks.push(Promise.all(promise));
            });
            return Promise.all(tasks).then(function () {
                return data;
            })
        })
}