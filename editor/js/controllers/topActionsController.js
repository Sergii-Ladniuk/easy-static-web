eswEditor.controller('TopPanelActionsController', function ($scope, $http, $location, $uibModal, PostEditorService) {

    function gitCommandCallback(res) {
        alert(res.data + '\nPlease refresh the browser window now.');
        setTimeout(function () {
            $location.url('/');
        }, 2000)
    }

    $scope.revert = function () {
        $http.post('/revert').then(gitCommandCallback);
    };
    $scope.update = function () {
        $http.post('/update-git').then(gitCommandCallback);
    };
    $scope.commit = function () {
        $http.post('/commit-git', {message: $scope.commitMessage}).then(gitCommandCallback);
    };
    $scope.publish = function (publishDraft) {
        PostEditorService.publishStart();
        $http.post('/publish?publishDraft='+publishDraft, PostEditorService.post)
          .then(function (res) {
              PostEditorService.publishDone();
              alert(res.data + '\nPlease refresh the browser window now.');
          });
    };

    $scope.newPost = function (type) {
        $uibModal.open({
            templateUrl: '/views/single-entry-field-window.html',
            controller: 'EditOneFieldController',
            resolve: {
                args: function () {
                    return {
                        title: 'Create a new post',
                        placeholder: 'Post title'
                    };
                }
            }
        }).result.then(function (title) {
            var path = '/new-' + type;
            $http.post(path, {title: title}).then(function(fileName) {
                console.log(fileName);
                PostEditorService.reloadPostList(fileName);
            });
        });
    }
});
