var renderPage = require('./render-page');
var saveContent = require('./save-content');
var sitemapRenderer = require('./render-sitemap');

const renderSingleAll = function (data) {
    var postIndex = 4;
    return Promise.map(
        data.list
            .map(function (content) {
                postIndex++
                content.priority = Math.floor(10 - postIndex / 2) / 10;
                if (content.priority < 0.3) {
                    content.priority = 0.3;
                }
                return content;
            }),
        function (content) {
            var article = getArticleData(content);
            content.meta.articleSchema = JSON.stringify(article);

            var promise = saveContent(data, renderPage(data, content, 'single.jade', content.meta), 0, content.meta.slug);

            if (content.meta.slug !== '404' && !content.meta.draft) {
                sitemapRenderer.add('http://marinatravelblog.com/' + content.meta.slug + '/', 'monthly', content.priority);
            }
            if (!promise.then) {
                throw new Error('bad promise')
            }
            promise.catch(function (err) {
                console.log('failed to save ', content.meta.title, err);
            });
            return promise;
        }, {concurrency: 2});
};

module.exports = renderSingleAll;

function getArticleData(content) {
    return {
        "@context": "http://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": content.meta.link
        },
        "headline": content.meta.seo.title,
        "author": [{
            "@type": "Person",
            "name": "Maryna Sukhomlynova",
            "url": "https://plus.google.com/113719564593581367589/",
            "affiliation": "marinatravelblog"
        },
            {
                "@type": "Person",
                "name": "Sergii Ladniuk",
                "url": "https://plus.google.com/u/0/116606126305251345109",
                "affiliation": "marinatravelblog"
            }],
        "datePublished": content.meta.publishedDate ? content.meta.publishedDate.toISOString() : "",
        "dateModified": content.meta.modifiedDate ? content.meta.modifiedDate.toISOString() : "",
        "publisher": {
            "@type": "Organization",
            "name": "marinatravelblog",
            "url": "http://marinatravelblog.com",
            "sameAs": [
                "http://www.facebook.com/marinatravelblog",
                "http://twitter.com/marinatravelblg",
                "https://www.youtube.com/c/marinatravelblog",
                "http://vk.com/marinatravelblog",
                "https://plus.google.com/+Marinatravelblog/posts/",
                "https://instagram.com/sergii_ladniuk/"
            ],
            "logo": {
                "@type": "ImageObject",
                "url": "http://marinatravelblog.com/wp-content/uploads/logo-valley-of-fire-long.jpg",
                "width": 401,
                "height": 60
            }
        }
        ,
        "image": {
            "@type": "ImageObject",
            "url": content.meta.img,
            "width": 800,
            "height": 533
        }
    };
}