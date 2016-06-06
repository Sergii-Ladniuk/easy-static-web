'use strict';

const general = require('../lib/general');
const logger = require('../lib/logger');

const fs = general.fs;
const path = require('path');

const parseArgs = require('minimist');

const settings = require('../settings.js').loadSync();

const os = require('os');

const buildPreviewSemaphor = Promise.promisifyAll(require('semaphore')(1));

const generate = require('../generate').generate;
const htmlStorage = require('../lib/render-all/html-storage');

const takeAsync = function (semaphor) {
    return new Promise(function (done) {
        semaphor.take(function () {
            done();
        });
    });
};

const init = exports.init = function () {
    htmlStorage.storeInMemory = true;
    return new Promise(function (done) {
        done()
    })
};

const previewFunctionBuilder = function () {
    let inProgress = false;
    let requested = false;

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
                    logger.log('Generate failed due to an error: ',err);
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

