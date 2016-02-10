global.Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

var spawn = require('child_process').spawn

var ncp = require('ncp').ncp
var ncpAsync = Promise.promisify(ncp)
ncp.limit = 16

const script = {};

function runExternal(cmd, opts) {
    return new Promise(function (done, reject) {
        console.log('run extr ' + cmd)
        try {
            var s = spawn(cmd, opts);
            var error = true;
            s.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
            });

            s.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            s.on('exit', function (code) {
                console.log('done with code ' + code)
                done();
            })
        } catch (err) {
            console.log(err)
            reject()
        }
    })
}

runExternal('rm', ['-rf', '../public']).then(
    Promise.join(
        runExternal('/usr/local/bin/hugo', ['--source', '/Users/sergii/dev/blog-hugo/']),
        fs.readFileAsync(__dirname + '/categories.json', 'utf-8'),
        require('./../settings.js').load
    ).spread(function (_, data, settings) {
            var categories = JSON.parse(data)
            script.settings = settings
            var publicPath = __dirname + '/../public/'
            var sourceRoot = publicPath + '/categories/'
            var destinationRoot = publicPath
            Object.keys(categories).forEach(function (categoryName) {
                var category = categories[categoryName]
                var copyCategory = function (category, destination) {
                    var source = sourceRoot + '/' + category.name.replace(' ', '-')
                    var destination = destination + '/' + category.niceName
                    console.log("cp " + source + " " + destination)
                    ncp(source, destination, function (err) {
                        if (err) {
                            return console.error(err)
                        } else {
                            if (category.children) {
                                category.children.forEach(function (child) {
                                    copyCategory(child, destination)
                                })
                            }
                        }
                    })
                }
                copyCategory(category, destinationRoot)
            })
            return fs.readdirAsync(script.settings.path.pagesFolder)
        })
        .each(function (fileName) {
            console.log('map : ' + fileName)
            if (!/^\./.test(fileName) && !/\.[xh][t]*ml$/.test(fileName)) {
                return ncpAsync(
                    path.join(script.settings.path.pagesFolder, fileName),
                    path.join(script.settings.path.publicFolder, fileName))
            }
        }).each(function (file) {
            console.log('cp: '+ file)
        })
)

