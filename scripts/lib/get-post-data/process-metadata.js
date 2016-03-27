'use strict';
var general = require('../general');

var fs = general.fs;
var mm = require('./meta-marked');
var marked = require('marked');
var extend = require('extend');
var os = require('os');
var newline = os.EOL;
var util = require('util');
var equal = require('deep-equal');

var processMetadata = function (data) {

    try {
        var target = data.target;

        if (!target.meta) {
            var parsedData = mm(target.text);
            extend(true, target, parsedData);
        }


        if (!target.meta.slug) {
            throw  new Error("No slug specified for", target.path)
        }

        if (typeof target.meta.categories === 'string') {
            target.meta.categories = parseArray(target.meta.categories);
        }

        if (typeof target.meta.tags === 'string') {
            target.meta.tags = parseArray(target.meta.tags);
        }

        target.meta.seo = target.meta.seo || {};
        target.meta.seo.keywords = target.meta.seo.keywords || '';
        target.meta.seo.keywords = parseArray(target.meta.seo.keywords);

        if (!target.meta.shortLink || !/\?(.*)/.test(target.meta.shortLink)) {
            target.meta.shortLink = target.meta.link;
            target.meta.id = target.meta.slug;
        } else {
            target.meta.id = /\?(.*)/.exec(target.meta.shortLink)[1];
            var regExp = /page_id=(.*)/;
            if (regExp.test(target.meta.id)) {
                target.meta.id = target.meta.id.replace(regExp, '$1');
            }
        }


        ['featured-tag', 'featured-category'].forEach(function (item) {
            target.meta[item] = slugifyAll(arrayifyIfString(target.meta[item]));
        });

        if (target.meta.link) {
            target.meta.link = target.meta.link.replace('marinatravelblog.com', 'localhost:4000');
        } else {
            target.meta.link = 'http://localhost:4000/' + target.meta.slug;
        }

        if (target.meta.modifiedDate) {
            target.meta.showDate = daysBetween(target.meta.modifiedDate, new Date()) < 90;
            var dateFormat = require('dateformat');
            target.meta.modifiedDateFormatted = dateFormat(target.meta.modifiedDate, 'dd.mm.yyyy');
        }

        extend(data.common, {
            categories: target.meta.type === 'page' ? [] : target.meta.categories.map(function (category) {
                return {
                    name: category.toLowerCase(),
                    posts: [target]
                }
            }),
            tags: target.meta.type === 'page' ? [] : target.meta.tags.map(function (tag) {
                return {
                    name: tag.toLowerCase().replace(/ +/g, '-'),
                    posts: [target]
                }
            }),
            list: [target]
        });

        target.link = target.meta.link = target.meta.link
            || general.linkBuilder.postUrl(target.meta.slug || target.slugByPath, data);

        delete target.text;

        return data;
    } catch (e) {
        e.message = "\nFailed to process " + data.target.path + " (metadata error)\n" + e.message;
        throw e;
    }
};

module.exports = processMetadata;

function daysBetween(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
}

function arrayifyIfString(item) {
    if (typeof item === 'string') {
        return [item];
    } else {
        return item;
    }
}

function slugifyAll(arr) {
    return !arr || !arr.length ? [] : arr.map(function (item) {
        return general.util.slugifyOnly(item);
    })
}

function parseArray(str) {
    return str.split(',').map(function (kw) {
        return kw.replace(/^ +/g, '').replace(/ $/g, '');
    }).filter(function (kw) {
        return kw;
    });
}

// tests:

if (typeof describe === 'undefined') describe = function () {
};

describe("process-metadata :", function () {
    var should = require('should');
    var newline = require('os').EOL;
    var util = require('util');
    var general = require('../general');
    var path = require('path');

    // given
    var givenTarget = {
        slugByPath: 'sample-post',
        name: 'sample-post'
    };
    var basic = {
        settings: {
            local: {
                port: 12
            }
        }
    };
    var givenData = {
        target: givenTarget,
        common: {},
        basic: basic
    };
    var expectedTarget = {
        "link": "http://url.com/boliviya-kopakabana/",
        meta: {
            type: "post",
            title: 'Боливия. Двойственные впечатления о Копакабане (Copacabana)',
            link: 'http://url.com/boliviya-kopakabana/',
            date: 'Tue, 15 Dec 2015 00:02:12 +0000',
            shortLink: 'http://marinatravelblog.com/?p=7903',
            seo: {
                keywords: 'some keys',
                description: 'text4ggoogle',
                title: 'title4search'
            },
            slug: 'boliviya-kopakabana',
            categories: ['c1', 'c2'],
            tags: ['t1', 't2']
        },
        markdown: '\n# head #\ntext text text http://url.com',
        "html": "<h1 id=\"head\">head</h1>\n<p>text text text <a href=\"http://url.com\">http://url.com</a></p>\n",
        slugByPath: 'sample-post',
        name: 'sample-post'
    };
    var expectedData = {
        target: expectedTarget,
        basic: basic,
        common: {
            list: [expectedTarget],
            categories: ['c1', 'c2'],
            tags: ['t1', 't2']
        }
    }

    var text;

    before(function () {
        return general.fs.readFileAsync(path.join(__dirname, "samples", "sample-post.md"), "utf-8")
            .then(function (txt) {
                text = txt;
                givenTarget.text = txt;
            })
        //.then(general.fs.readFileAsync(path.join(__dirname, "samples", "sample-html-output.md"), "utf-8"))
        //.then(function( txt){
        //    expectedTarget.html = txt;
        //}) ;
    });


    it('should change urls to localhost', function () {
        // when
        var resultData = processMetadata(givenData);
        // then
        resultData.common.categories = resultData.common.categories.map(function (category) {
            return category.name;
        })
        resultData.common.tags = resultData.common.tags.map(function (tag) {
            return tag.name;
        })
        resultData.should.deepEqual(expectedData);
    })
});



