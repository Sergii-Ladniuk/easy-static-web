var general = require('../../general');

function stripTrailingSlash(str) {
    if (str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function toLocalhost(text, url, port) {
    var localhost = 'http://localhost:' + port;
    var regex = new RegExp(general.util.escapeRegExp(stripTrailingSlash(url)), 'g');
    return text.replace(regex, localhost);
}

exports.changeToLocalhost = function (data) {
    data.target.link = 'http://localhost:4000/' + data.target.meta.slug+'/';
    return data;
};

var should = require('should');
if (typeof describe === 'undefined') describe = function () {
};

describe("process-urls :", function () {
    // given
    var newline = require('os').EOL;
    var util = require('util');
    var text = util.format("qweqweqw %s http://link.com/asd.com %s see http://link.com/dd link.com!", newline, newline);
    var expectedText = util.format("qweqweqw %s http://localhost:12/asd.com %s see http://localhost:12/dd link.com!", newline, newline);
    var basic = {
        settings: {
            server: {
                prod: {
                    url: "http://link.com"
                },
                local: {
                    port: 12
                }
            }
        }
    };
    var data = {
        basic: basic,
        common: {
            list: [
                {markdown: text, meta:{link:"http://link.com/q"}},
                {markdown: "no urls", meta:{link:""}}
            ]
        }
    };
    var expectedData = {
        basic: basic,
        common: {
            list: [
                {markdown: expectedText, meta:{link:"http://localhost:12/q"}},
                {markdown: "no urls", meta:{link:""}}
            ]
        }
    };

    // when
    data = exports.changeToLocalhost(data);

    it('should change urls to localhost', function () {
        data.should.deepEqual(expectedData);
    })
});