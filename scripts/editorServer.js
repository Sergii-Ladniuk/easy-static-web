'use strict';

var express = require('express');
var path = require('path');
var http = require('http');
var util = require('util');
var cors = require('cors');

var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

var previewBuilder = require('./editor/previewBuilder');
var rest = require('./editor/editorService');
var storage = require('./lib/render-all/html-storage');
var settings = require('./settings').loadSync();

var app = express();
var port = 4002;

app.use(cors);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-promise')());

require('./editor/editorGit').bind(app);
require('./editor/editorCommonApi').bind(app);

app.use("/img", express.static("./static/img"));
app.use(express.static('./editor'));
app.use(express.static('./public-debug'));

// catch 404
app.use(function (req, res) {
    res.status(404);
    res.send('404: такой страницы нет :(');
});

app.use(function (err, req, res, next) {
    console.dir(err);
    res.status(err.status || 500);
});

module.exports = app;

rest.loadContent()
    .then(previewBuilder.init)
    .then(previewBuilder.buildPreview)
    .then(function () {
        require('./testServer').run(true);
    })
    .then(function () {
        http.createServer(app).listen(port, function () {
            console.log('Express server listening on port ' + port);
        });
    });