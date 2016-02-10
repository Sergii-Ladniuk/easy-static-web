// FIXME
exports.postUrl = function(slug, data) {
    return 'http://localhost:/'+ data.basic.settings.server.local.port + slug;
};