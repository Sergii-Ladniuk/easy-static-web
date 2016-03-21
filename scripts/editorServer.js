var express = require('express');
var path = require('path');
var http = require('http');

var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

var rest = require('./editor/editorRest');

var app = express();
var port = 4002;


app.get('/list', function (req, res) {
    rest.list().then(function(list) {
        res.send(list)
    })
});

app.get('/images', function(req,res) {
    rest.images().then(function(list) {
        res.send(list)
    })
});

app.use("/img", express.static("../static/img"));
app.use(express.static('../editor'));

// catch 404
app.use(function (req, res) {
    res.status(404);
    res.send('404: такой страницы нет :(');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log(err)
        res.status(err.status || 500);
        res.render(JSON.stringify(err));
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
});

module.exports = app;

http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});