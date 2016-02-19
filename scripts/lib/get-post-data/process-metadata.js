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

        var parsedData = mm(target.text);

        extend(true, target, parsedData);

        target.meta.seo = target.meta.seo || {};
        target.meta.seo.keywords = target.meta.seo.keywords || '';
        target.meta.seo.keywords = target.meta.seo.keywords.split(',').map(function (kw) {
            return kw.replace(/^ +/g, '').replace(/ $/g, '');
        }).filter(function (kw) {
            return kw;
        });
        //    .map(function(kw) {
        //    // ((камбоджа!!) ((ангор ват!!храм ангор)) ((отзывы!!негативные отзывы!!советы!!на велосипеде))
        //    function simplify(kw) {
        //        if (!/\(\(/.test(kw)) {
        //            return [kw];
        //        } else {
        //            var regex = /(.*?)\[(.*?)\](.*)/;
        //
        //        }
        //    }
        //});


        ['featured-tag', 'featured-category'].forEach(function (item) {
            target.meta[item] = slugifyAll(arrayifyIfString(target.meta[item]));
        });

        target.meta.link = target.meta.link.replace('marinatravelblog.com', 'localhost:4000');

        //var oldPost = data.basic.oldData[target.path];
        //
        //delete oldPost.meta.img;
        //target.changes = {
        //    meta: !equal(oldPost.meta, target.meta),
        //    md: !equal(oldPost.markdown, target.markdown)
        //};
        //
        //if (oldPost) {
        //    if (target.changes.meta || target.changes.md) {
        //        var date = new Date();
        //        var updatedText = target.text.replace(/modifiedDate\: *[\'\"].*?[\'\"]/,
        //            "modifiedDate: '" +
        //            date.toISOString().replace('T',' ').replace('Z','') + "'");
        //        target.meta.modifiedDate = date;
        //        console.log(target.path, 'changed')
        //        fs.writeFileAsync(target.path, updatedText);
        //    }
        //}

        extend(data.common, {
            categories: target.meta.type === 'page' ? [] : parsedData.meta.categories.map(function (category) {
                return {
                    name: category.toLowerCase(),
                    posts: target.meta.draft ? [] : [target],
                }
            }),
            tags: target.meta.type === 'page' ? [] : parsedData.meta.tags.map(function (tag) {
                return {
                    name: tag.toLowerCase().replace(/ +/g, '-'),
                    posts: target.meta.draft ? [] : [target],
                }
            }),
            list: [target]
        });
        target.link = target.meta.link = target.meta.link || general.linkBuilder.postUrl(target.meta.slug || target.slugByPath, data);
        delete target.text;

        return data;
    } catch (e) {
        e.message = "\nFailed to process " + data.target.path + " (metadata error)\n" + e.message;
        throw e;
    }
};

module.exports = processMetadata;

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



