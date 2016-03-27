'use strict';

var eswEditor = angular.module('eswEditor', [
    'ui.ace',
    'ui.bootstrap'
]);

eswEditor.controller('MainController', function ($scope, $http) {
    $scope.text = '';
    $scope.postInfo = '';
});

eswEditor.controller('PostListController', function ($scope, $http, PostEditorService) {
    $http.get("/list")
        .then(function (response) {
            $scope.posts = response.data;
            $scope.drafts = response.data.filter(function (post) {
                return post.meta.draft;
            });
            $scope.publishedPosts = response.data.filter(function (post) {
                return !post.meta.draft;
            });
            PostEditorService.post = $scope.drafts[0];
            PostEditorService.posts = $scope.posts;

            $scope.select = function (post) {
                PostEditorService.post = post;
            };

            console.log($scope.drafts.map(function (post) {
                return post.name;
            }));
        });
});

eswEditor.factory('PostEditorService', function ($http) {
    var shouldSave, savingNow;
    return {
        save: function save(post) {
            if (savingNow) {
                shouldSave = true;
            } else {
                savingNow = true;
                var promise = $http.post("/post", post);
                promise.then(function () {
                    savingNow = false;
                    if (shouldSave) {
                        shouldSave = false;
                        save(post);
                    }
                });
                return promise;
            }
        }
    };
});

eswEditor.factory('ImageService', function ($http) {
    var service = {
        addImg: function () {
        },
        images: [],
        reloadImages: function () {
            $http.get('/images').then(function (response) {
                service.images = response.data;
            });
        }
    };
    service.reloadImages();
    return service;
});

eswEditor.controller('PostEditorController', function ($scope, $http, PostEditorService, ImageService) {
    $scope.service = PostEditorService;
    $scope.alt = "";
    ImageService.addImg = function (url, alt) {
        //insertAtCursor($('.markdown-input')[0], '![' + alt + '](' + url + ')');
        $scope.editor.insert('![' + alt + '](' + url + ')');
    };
    $scope.addLink = function () {
        $scope.editor.insert('[' + $scope.editor.getSelectedText() + '](' + 'http://localhost:4000/'
            + $scope.postToLink.meta.slug + ')');
    };
    $scope.$watch('service.post', function (post) {
        if (post) {
            var promise = PostEditorService.save(post);
            if (promise) {
                promise.then(function (response) {
                    $scope.console += response.data;
                });
            }
        }
    }, true);
    $scope.aceLoaded = function (_editor) {
        $scope.editor = _editor;
        //$('.ace_line > *').attr('spellcheck', "true" ).attr('contenteditable', "true" )
    }
});

eswEditor.controller('ImageController', function ($scope, ImageService) {
    $scope.service = ImageService;
    $scope.refresh = function () {
        ImageService.reloadImages();
    };
});

$(function () {
    $(".spoiler-trigger").click(function () {
        $(this).parent().next().collapse('toggle');
    });
    $('.markdown-input').attr('ng-change', 'onPostChanged(post)');
});

function insertAtCursor(textArea, myValue) {
    //IE support
    if (document.selection) {
        textArea.focus();
        //in effect we are creating a text range with zero
        //length at the cursor location and replacing it
        //with myValue
        var sel = document.selection.createRange();
        sel.text = myValue;
        //Mozilla/Firefox/Netscape 7+ support
    } else if (textArea.selectionStart || textArea.selectionStart == '0') {
        textArea.focus();
        //Here we get the start and end points of the
        //selection. Then we create substrings up to the
        //start of the selection and from the end point
        //of the selection to the end of the field value.
        //Then we concatenate the first substring, myValue,
        //and the second substring to get the new value.
        var startPos = textArea.selectionStart;
        var endPos = textArea.selectionEnd;
        textArea.value = textArea.value.substring(0, startPos) + myValue + textArea.value.substring(endPos, textArea.value.length);
        textArea.setSelectionRange(endPos + myValue.length, endPos + myValue.length);
    } else {
        textArea.value += myValue;
    }
    //$('html, body').animate(
    //    { scrollTop: textArea.offsetTop },
    //    2000);
    ////$('html, body').scrollTop(textArea.offsetTop);
    //textArea.scrollTop(textArea.scrollHeight - textArea.height());
}