/**
 * Copies all elements from array b to array a if they are not present there
 * @param a target array
 * @param b source array
 */
function mergeUnique(a, b) {

    var hash = {};

    // put all a's elements to hash
    a.forEach(function (i) {
        hash[i] = 1;
    });

    b.forEach(function (i) {
        if (!hash[i]) {
            hash[i] = 1;
            a.push(i);
        }
    })
}

function mergeTags(a, b) {
    var hash = {};

    // put all a's elements to hash
    a.forEach(function (i) {
        hash[i.name] = i;
    });

    b.forEach(function (i) {
        if (!hash[i.name]) {
            a.push(i);
        } else {
            var dest = hash[i.name].posts;
            var src = i.posts;
            hash[i.name].posts = mergeOrdered(dest, src, compareByDate);
        }
    })
}

function mergeOrdered(a, b, comparator) {
    var r = [],
        i = 0, j = 0;
    while (i < a.length && j < b.length) {
        if (comparator(a[i], b[j])) {
            r.push(a[i++]);
        } else {
            r.push(b[j++]);
        }
    }
    while (i < a.length) {
        r.push(a[i++]);
    }
    while (j < b.length) {
        r.push(b[j++]);
    }
    return r;
}

function compareByDate(a, b) {
    return a.meta.publishedDate > b.meta.publishedDate
}

function mergePostAll(a, b) {
    a.common.list = mergeOrdered(a.common.list, b.common.list, compareByDate);
    mergeTags(a.common.categories, b.common.categories);
    mergeTags(a.common.tags, b.common.tags);
    return a;
}

module.exports = mergePostAll;

// tests

var should = require('should');

if (typeof describe === 'undefined') describe = function () {
};

describe("merge-post-all function :", function () {

    // posts simplified:
    var p4 = {meta: {name: '4', date: new Date(2011, 10, 03)}};
    var p3 = {meta: {name: '3', date: new Date(2012, 10, 03)}};
    var p2 = {meta: {name: '2', date: new Date(2013, 11, 01)}};
    var p1 = {meta: {name: '1', date: new Date(2014, 11, 01)}};

    var a = {
        common: {
            categories: [{name: 'a', posts: [p1, p2]}, {name: 'b', posts: [p2, p4]}],
            tags: [{name: 'x', posts: [p2]}, {name: 'y', posts: [p2, p4]}],
            list: [
                p2,
                p4
            ]
        }
    };

    var b = {
        common: {
            categories: [{name: 'c', posts: [p2, p4]}, {name: 'b', posts: [p3]}],
            tags: [{name: 'z', posts: [p3]}, {name: 'y', posts: [p1]}, {name: 'w', posts: [p2]}],
            list: [
                p1,
                p3
            ]
        }
    };

    var result = mergePostAll(a, b);

    var catMapping = function (i) {
        var name = i.name;
        var posts = i.posts.map(function (p) {
            return p.meta.name;
        })
        var res = {};
        res[name] = posts;
        return res;
    };

    var categories = result.common.categories.map(catMapping);
    var tags = result.common.tags.map(catMapping);

    it("should merge categories with no repeat, order is not important", function () {
        categories.should.containEql({a: ['1', '2']});
        categories.should.containEql({b: ['2', '3', '4']});
        categories.should.containEql({c: ['2', '4']});
        categories.length.should.be.exactly(3);
    });
    it("should merge tags with no repeat, order is not important", function () {
        //[
        //    {name: 'x', posts:[p2]},
        //    {name: 'y', posts:[p1,p2,p4]},
        //    {name: 'z', posts:[p3]},
        //    {name: 'w', posts:[p2]}
        //]
        //    .forEach(function (e) {
        //        result.common.tags.should.containEql(e);
        //    });
        tags.should.containEql({x: ['2']});
        tags.should.containEql({y: ['1', '2', '4']});
        tags.should.containEql({z: ['3']});
        tags.should.containEql({w: ['2']});

        result.common.tags.length.should.be.exactly(4);
    });
    it('should return merged list of posts, ordered by date, new posts first', function () {
        result.common.list.map(function (post) {
            return post.meta.name;
        }).should.deepEqual(['1', '2', '3', '4']);
    });
});