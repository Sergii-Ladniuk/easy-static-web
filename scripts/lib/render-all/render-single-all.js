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

            if (content.meta.slug !== '404' && !content.meta.draft && content.meta.type !== 'page' && (content.meta.type !== 'post' || content.meta.noindex !== true)) {
                sitemapRenderer.add('https://marinatravelblog.com/' + content.meta.slug + '/', 'monthly', content.priority);
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
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": content.meta.link
        },
        "headline": content.meta.seo.title,
        "author": [{
            "@type": "Person",
            "name": "Maryna Sukhomlynova",
            "affiliation": "marinatravelblog"
        },
            {
                "@type": "Person",
                "name": "Sergii Ladniuk",
                "affiliation": "marinatravelblog"
            }],
        "datePublished": content.meta.publishedDate ? content.meta.publishedDate.toISOString() : "",
        "dateModified": content.meta.modifiedDate ? content.meta.modifiedDate.toISOString() : "",
        "publisher": {
            "@type": "Organization",
            "name": "marinatravelblog",
            "url": "https://marinatravelblog.com",
            "sameAs": [
                "https://www.facebook.com/marinatravelblog",
                "https://twitter.com/marinatravelblg",
                "https://www.youtube.com/c/marinatravelblog",
                "https://vk.com/marinatravelblog",
                "https://instagram.com/sergii_ladniuk/"
            ],
            "logo": {
                "@type": "ImageObject",
                "url": "https://marinatravelblog.com/wp-content/uploads/logo-valley-of-fire-long.jpg",
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
