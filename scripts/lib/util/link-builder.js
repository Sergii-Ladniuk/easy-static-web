// FIXME
exports.postUrl = function(slug, data) {
    return 'http://local.marinatravelblog.com:/'+ data.basic.settings.server.local.port + slug;
};