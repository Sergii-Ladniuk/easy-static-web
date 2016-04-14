eswEditor.controller('PostListController', function ($scope, $http, PostEditorService) {
    PostEditorService.reloadPostList = function (selectedPostName) {
        var promise = $http.get("/list");

        promise.then(function (response) {
            function selectedPost() {
                var defaultPost = $scope.drafts[0];

                if (!selectedPostName) {
                    return defaultPost;
                } else {
                    var selectedFiltered = $scope.posts.filter(function (post) {
                        return post.name === selectedPostName
                    });

                    return selectedFiltered[0] || defaultPost;
                }
            }

            $scope.posts = response.data;
            $scope.drafts = response.data.filter(function (post) {
                return post.meta.draft;
            });
            $scope.publishedPosts = response.data.filter(function (post) {
                return !post.meta.draft;
            });
            PostEditorService.post = selectedPost();
            console.log(PostEditorService.post)
            PostEditorService.posts = $scope.posts;

            $scope.select = function (post) {
                PostEditorService.post = post;
            };
        });

        return promise;
    };

    PostEditorService.reloadPostList();
});