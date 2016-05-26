var general = require('../lib/general');

var fs = general.fs;
var path = require('path');

var parseArgs = require('minimist');

var settings = require('../settings.js').loadSync();

var os = require('os');

var buildPreviewSemaphor = Promise.promisifyAll(require('semaphore')(1));

var generate = require('../generate').generate;
var htmlStorage = require('../lib/render-all/html-storage');

var takeAsync = function (semaphor) {
    return new Promise(function (done) {
        semaphor.take(function () {
            done();
        });
    });
};

var init = exports.init = function () {
    htmlStorage.storeInMemory = true;
    return new Promise(function (done) {
        done()
    })
};

var previewFunctionBuilder = function () {
    var inProgress = false;
    var requested = false;

    return function doBuild(post) {
        if (inProgress) {
            requested = true;
            return new Promise(function (done) {
                done()
            })
        } else {
            inProgress = true;
            return generate({contentInMemory: true})
                .catch(function(err) {
                    console.log(err)
                })
                .finally(function () {
                    inProgress = false;
                    if (requested) {
                        requested = false;
                        doBuild(post)
                    }
                })
        }
    }
};

exports.buildPreview = previewFunctionBuilder();

