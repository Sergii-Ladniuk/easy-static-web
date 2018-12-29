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
var dateFormat = require('dateformat');

function getCategoryData(target) {
    if (target.meta.type === 'post') {
        return target.meta.categories.map(function (category) {
            return {
                name: category.toLowerCase(),
                posts: [target]
            }
        });
    }
    if (target.meta.type === 'category') {
        return target.meta.categories.map(function (category) {
            return {
                name: category.toLowerCase(),
                landing: target,
                posts: []
            }
        });
    }
    return [];
}

function getTagsData(target) {
    return target.meta.type === 'page' ? [] : target.meta.tags.map(function (tag) {
        return {
            name: tag.toLowerCase().replace(/ +/g, '-'),
            posts: [target]
        }
    });
}

function processPublishedDate(target) {
    if (target.meta.publishedDate) {
        try {
            if (typeof target.meta.publishedDate === 'string') {
                target.meta.publishedDate = new Date(target.meta.publishedDate);
            }
            target.meta.showDate = daysBetween(target.meta.publishedDate, new Date()) < 90;
        } catch (err) {
            console.error('publishedDate has wrong format:', target.meta.publishedDate);
            throw err;
        }
    }
}

function processModifiedDate(target) {
    target.meta.modifiedDate = new Date(target.mtime);
    target.meta.showDate = daysBetween(target.meta.modifiedDate, new Date()) < 90;
    target.meta.modifiedDateFormatted = dateFormat(target.meta.modifiedDate, 'dd.mm.yyyy');
}

function processMeta(target) {
    if (!target.meta) {
        var parsedData = mm(target.text);
        extend(true, target, parsedData);
    }


    if (!target.meta.slug) {
        throw  new Error("No slug specified for " + target.path + " " + target.name)
    }

    target.meta.categories = arrayifyIfString(target.meta.categories);
    target.meta.tags = arrayifyIfString(target.meta.tags);

    target.meta.seo = target.meta.seo ? extend({}, target.meta.seo) : {};
    target.meta.seo.keywords = target.meta.seo.keywords || '';
    target.meta.seo.keywords = parseArray('' + target.meta.seo.keywords);

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

    target.meta['featured-tag'] = slugifyAll(arrayifyIfString(target.meta['featured-tag']));
    target.meta['featured-category'] = toLowerAll(arrayifyIfString(target.meta['featured-category']));

    target.meta.link = 'http://localhost:4000/' + target.meta.slug + '/';
}

var processMetadata = function (data) {

    try {
        var target = data.target;

        processMeta(target);
        processPublishedDate(target);
        processModifiedDate(target);

        extend(data.common, {
            categories: getCategoryData(target),
            tags: getTagsData(target),
            list: [target]
        });

        target.link = target.meta.link;

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
        return parseArray(item);
    } else {
        return item;
    }
}

function slugifyAll(arr) {
    return !arr || !arr.length ? [] : arr.map(function (item) {
        return general.util.slugifyOnly(item);
    })
}

function toLowerAll(arr) {
    return !arr || !arr.length ? [] : arr.map(function (item) {
        return item.toLowerCase();
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

if (typeof describe === 'undefined') var describe = function () {
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
    });


    it('should change urls to localhost', function () {
        // when
        var resultData = processMetadata(givenData);
        // then
        resultData.common.categories = resultData.common.categories.map(function (category) {
            return category.name;
        });
        resultData.common.tags = resultData.common.tags.map(function (tag) {
            return tag.name;
        });
        resultData.should.deepEqual(expectedData);
    })
});



