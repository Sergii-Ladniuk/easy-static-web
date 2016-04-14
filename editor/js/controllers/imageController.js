eswEditor.controller('ImageController', function ($scope, ImageService) {
    $scope.service = ImageService;
    $scope.refresh = function () {
        ImageService.reloadImages();
    };
});