var renderTemplate = require('./render-template');
var saveContent = require('./save-content');

const renderRss = module.exports =  function (data) {
    var content = {
        posts: data.list.filter(function(post) {
            return !post.draft && post.meta.type === 'post';
        })
    };
    return saveContent(data, renderTemplate('rss.jade', data, content),0, null, 'xml', 'feed');
};