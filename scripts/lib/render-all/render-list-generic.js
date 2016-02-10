var renderPage = require('./render-page');
var saveContent = require('./save-content');

function renderIndexPage(data, page) {
    return renderPage(data, page, 'index.jade');
}

function savePage(htmlPromise, index, data, folder) {
    saveContent(data, htmlPromise, index, folder)
}

function renderIndexFunction(pageSize, folder) {
    return doRenderIndexFunction(renderIndexPage, savePage, pageSize, folder);
}

function doRenderIndexFunction(renderPage, savePage, pageSize, folder) {
    var renderIndex = function (data, list) {
        var list = list || data.list;

        var totalIndex = 0,
            currentIndex = 0,
            totalLength = list.length,
            nextPage = [],
            pageIndex = 0,
            tasks = [];

        function createPage() {
            var promise = savePage(renderPage(data, nextPage), pageIndex++, data, folder);
            tasks.push(promise);
        }

        while (totalIndex < totalLength) {
            if (!list[totalIndex].meta.draft && list[totalIndex].meta.type === 'post') {
                nextPage[currentIndex++] = list[totalIndex++];
                if (currentIndex == pageSize) {
                    createPage();
                    currentIndex = 0;
                    nextPage = [];
                }
            } else {
                totalIndex++;
            }
        }

        if (currentIndex > 0) {
            createPage();
        }

        return Promise.all(tasks);
    };
    return renderIndex;
}

module.exports = renderIndexFunction;

// tests

if (typeof describe === 'undefined') describe = function () {
};

// FIXME
//describe("render-index : ", function () {
//
//    var sinon = require('sinon');
//
//    var post = function (name, draft) {
//        return {meta: {name: name, draft: draft, type: 'post'}};
//    };
//
//    it('should not render drafts', function () {
//        // given
//        var render = sinon.spy();
//        var save = sinon.spy();
//        var renderIndex = doRenderIndexFunction(render, save, 10);
//        var i = 0,
//            posts = [];
//        [false, true, false, false, true].map(function (draft) {
//            posts[i++] = post(i, draft);
//        })
//        var renderIndex = doRenderIndexFunction(render, save, 10);
//        // when
//        renderIndex({list: posts});
//        // then
//        render.callCount.should.equal(1);
//        render.getCall(0).args[1].should.deepEqual([post(1, false), post(3, false), post(4, false)]);
//    })
//
//    it('should pass rendered html to save', function () {
//        var html = '1';
//        var render = sinon.stub().returns(html);
//        var save = sinon.spy();
//        var renderIndex = doRenderIndexFunction(render, save, 10);
//        renderIndex({list: [post('a', false)]});
//        save.callCount.should.equal(1);
//        save.getCall(0).args[0].should.equal(html);
//    })
//
//    it('should not call when there is no data', function () {
//        var html = '1';
//        var render = sinon.stub().returns(html);
//        var save = sinon.spy();
//        var renderIndex = doRenderIndexFunction(render, save, 10);
//        renderIndex({list: []});
//        render.callCount.should.equal(0);
//        save.callCount.should.equal(0);
//    })
//
//    it('should do paging', function () {
//        // given
//        var render = sinon.spy();
//        var save = sinon.spy();
//        var renderIndex = doRenderIndexFunction(render, save, 10);
//        var i = 0,
//            posts = [];
//        for (; i < 25; i++) {
//            posts.push(post(i, false));
//        }
//        var renderIndex = doRenderIndexFunction(render, save, 10);
//        // when
//        renderIndex({list: posts});
//        // then
//        render.callCount.should.equal(3);
//        console.log('-------')
//        console.log(render.getCall(0).args[1])
//        console.log(render.getCall(1).args[1])
//        console.log(render.getCall(2).args[1])
//    })
//});