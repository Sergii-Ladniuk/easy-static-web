var general = require('../../general');
const fs = Promise.promisifyAll(require('fs'));
const findit = Promise.promisifyAll(require('findit'));
const path = require('path');
const jade = require('jade');

function readOneTemplate(filePath) {
    return fs.readFileAsync(filePath, "utf-8");
}

function compileOneTemplate(filePath) {
    return readOneTemplate(filePath)
        .then(function (templateContent) {
            return jade.compile(templateContent, {
                filename: filePath,
                pretty: true
            });
        });
}

function parseFileName(filePath) {
    var info = path.parse(filePath);
    return {
        compile: info.ext === '.jade',
        name: info.base,
        ext: info.ext
    };
}

function iterateTemplates(settings) {
    var finder = findit(settings.path.layouts);
    var templates = {};
    var embed = [];
    finder.on('file', function (filePath) {
        var info = parseFileName(filePath);
        if (info.ext === '.html' || info.ext === '.jade') {
            if (info.compile) {
                templates[info.name] = compileOneTemplate(filePath);
            } else {
                templates[info.name] = readOneTemplate(filePath);
            }
            embed.push({
                name: info.name,
                regexp: new RegExp('\\['
                    + general.util.escapeRegExp(path.parse(info.name).name).replace(/\-/g, '\\-')
                    + ' *(.*?) *\\]', 'g'),
                template: templates[info.name]
            });
            console.dir(embed[embed.length-1])
        }
    });
    return new Promise(function (done) {
        finder.on('end', function () {
            done(
                {
                    jadeTemplates: templates,
                    embedTemplates: embed
                })
        })
    })
}

function compileTemplates(settings) {
    var layoutPath = settings.path.layouts;
    return iterateTemplates(settings);
}

module.exports = compileTemplates;

// tests
var should = require('should');
if (typeof describe === 'undefined') describe = function () {
};

describe('compileTemplates', function (done) {
    it('should parse file name', function () {
        parseFileName('c:/qweasd/qwe.jade').should.deepEqual({name: 'qwe', compile: true});
        parseFileName('c:/qweasd/qwe.json').should.deepEqual({name: 'qwe', compile: false});
    });

    var temp = require('os').tmpdir();
    var templatePath = path.join(temp, 'abc.jade');

    beforeEach(function writeTemplate() {
        var jadeTemplate = '.one XXX';
        return fs.writeFileAsync(templatePath, jadeTemplate);
    })
    afterEach(function writeTemplate() {
        var jadeTemplate = '.one XXX';
        return fs.unlinkAsync(templatePath);
    })

    it('should return promise to object, containing promises to every template in the directory', function () {
        var promise = compileTemplates({
            path: {
                layouts: temp
            }
        });
        promise.should.eventually.have.property('jadeTemplates');
        return promise.then(function (objectWithPromise) {
            return objectWithPromise.jadeTemplates.abc.then(function (compiled) {
                var html = compiled();
                html.should.equal('\n<div class="one">XXX</div>');
            });
        });
    });
});