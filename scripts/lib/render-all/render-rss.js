var saveContent = require('./save-content');
var RSS = require('rss');

const renderRss = module.exports = function (data) {
    var content = {
        posts: data.list.filter(function (post) {
            return !post.draft && post.meta.type === 'post';
        })
    };

    var feedOpts = {
        title: 'marinatravelblog.com',
        site_url: 'https://marinatravelblog.com',
        description: 'Наша кругосветка и другие самостоятельные путешествия по Европе, Азии, США и Латинской Америке!',
        language: 'ru-RU',
        feed_url: 'https://marinatravelblog.com/feed.xml'
    };

    var feed = new RSS(feedOpts);

    data.list.forEach(function (post) {
        if (!post.meta.draft && post.meta.type === 'post') {
            feed.item({
                title: post.meta.title,
                description: post.summary.replace(/<div.*?>[^]*?<noscript.*?>([^]*?)<\/noscript>[^]*?<\/div>/g, '$1')
                + '<a href="' + post.meta.link + '">' + post.more + '</a>',
                url: post.meta.link,
                guid: post.meta.id,
                categories: post.meta.categories,
                date: post.meta.publishedDate
            });
        }
    });

    //return saveContent(data, renderTemplate('rss.jade', data, content), 0, null, 'xml', 'feed');
    return saveContent(data, feed.xml({indent: false}), 0, null, 'xml', 'feed');
};