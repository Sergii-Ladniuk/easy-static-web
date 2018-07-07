eswEditor.controller('PostEditorController', function ($scope, $http, PostEditorService, ImageService) {
    $scope.service = PostEditorService;
    $scope.alt = "";
    ImageService.addImg = function (url, alt) {
        $scope.editor.insert('![' + alt + '](' + url.replace('4002', '4000') + ')');
    };
    $scope.addLink = function () {
        $scope.editor.insert('[' + $scope.editor.getSelectedText() + '](' + 'http://local.marinatravelblog.com:4000/'
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