var general = require('../general');

var fs = general.fs;
var jade = require('jade');
var extend = require('extend');
var mkdirp = Promise.promisify(require('mkdirp'));

var path = require('path');

var renderPage = require('./render-page');
var saveContent = require('./save-content');
var renderIndexFunction = require('./render-list-generic');

// FIXME
var pageSize = 10;

module.exports = renderIndexFunction(pageSize);

