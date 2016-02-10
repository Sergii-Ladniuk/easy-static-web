var general = require('../../general');

var fs = general.fs;
var path = require('path');

var parseConfigAny = general.parseConfigAny;
var promiseObject = general.promiseObject;

/**
 * Reads wrapper.json or wrapper.yaml config
 * @param settings see settings.js
 * @returns promise to js object, containing a property 'wrapper'
 */
var readWrapperConfig = function (settings) {
    var layoutPath = settings.path.layouts;
    var wrapperPathJson = path.join(layoutPath, "wrapper");

    return promiseObject('wrapper', parseConfigAny(wrapperPathJson));
};

module.exports = readWrapperConfig;

var should = require('should');
if (typeof describe === 'undefined') describe = function () {
};
var os = require('os');

var sample = {ok: true};
var layoutsTml = os.tmpdir();

var settings = {
    path: {
        layouts: layoutsTml
    }
};

describe("read-wrapper-config function :", function () {
    var wrapperPath = path.join(layoutsTml, "wrapper.json");
    beforeEach(function() {
        return fs.writeFileAsync(wrapperPath, JSON.stringify(sample));
    })
    afterEach(function() {
        return fs.unlinkAsync(wrapperPath);
    })
    it('should read wrapper', function () {
        var promise = readWrapperConfig(settings);
        promise.should.eventually.deepEqual({wrapper: sample});
        return promise.should.be.fulfilled();
    });
});
