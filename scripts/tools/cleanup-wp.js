var general = require('../lib/general');

var Client = require('ftp');
var parseArgs = require('minimist');

var c = new Client();
var argv = parseArgs(process.argv.slice(2));

c.connect({
    host: argv.host,
    user: argv.user,
    password: argv.password
});

c.on('ready', function () {
    console.log('ready');
    //c.put('foo.txt', 'foo.remote-copy.txt', function(err) {
    //    if (err) throw err;
    //    c.end();
    //});
    var list = Promise.promisify(c.list);
    var targetPath = '/domains/marinatravelblog.com/public_html/wp-content/uploads/';
    c.list(targetPath, function (err, list) {
        list = list
            .map(function (item) {
                return item.name;
            })
            .filter(function (item) {
                return /.*?[0-9]{3}x[0-9]{3}/.test(item) && /[a-zA-Z0-9_\-\.]+/.test(item);
            })

        Promise.map(list, function (item) {
                console.log('deleting', item);

                return new Promise(function (done) {
                    c.delete(targetPath + item, function (err) {
                        if (err) {
                            console.error(err);
                            done();
                        } else {
                            console.log('deleted', item);
                            done(item)
                        }

                    })
                })
            }, {concurrency: 5})
            .then(function () {
                console.log('closing connection');
                c.end();
            });

    });
//list('/public_html/wp-content/uploads/')
//    .filter(function(item) {
//        return /[0-9]{3}x[0-9]{3}/.test(item);
//    })
//    .then(function(list) {
//        return Promise.map(list, function(item) {
//            console.log(item);
//            return item;
//        }, {concurrency: 2});
//    })
})
;