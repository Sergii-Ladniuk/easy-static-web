var express = require('express');
var path = require('path');
var http = require('http');

var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

var storage = require('./lib/render-all/html-storage');

function run(fromMemory) {
    require('./settings.js').load
        .then(function (settings) {
            var app = express();
            var public, port;

            if (argv.prod) {
                public = settings.path.public_prod._;
                port = 4001;
            }
            else {
                public = settings.path.public._;
                port = 4000;
            }

            if (fromMemory) {
                app.get('/:p', function (req, res) {
                    var name = req.params.p;
                    var html = storage.htmls[name] || storage.htmls[path.join(name, 'index.html')];
                    if (html) {
                        console.log(name, 'found in mem')
                    } else {
                        console.log(name, 'serve from disc')
                    }

                    res.send(html);
                })
            }

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
                console.dir(err);
                res.status(err.status || 500);
            });


            module.exports = app;

            http.createServer(app).listen(port, function () {
                console.log('Express server listening on port ' + port);
            });
        });
}

exports.run = run;