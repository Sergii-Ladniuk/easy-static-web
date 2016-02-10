var processUrls = require('./process-urls')

var preprocess = function(data){
    return processUrls.changeToLocalhost(data);
};

module.exports = preprocess;