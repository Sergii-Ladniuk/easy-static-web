var express = require('express');
var path = require('path');
var http = require('http');

var app = express();
const public = path.join(__dirname, '/../public-debug');

app.use(express.static(public));

// catch 404
app.use(function (req, res) {
    res.status(404);
    // FIXME
    //res.send('404');
    res.sendfile(path.join(public, '404.html'));
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

http.createServer(app).listen(4000, function () {
    console.log('Express server listening on port ' + 4000);
});