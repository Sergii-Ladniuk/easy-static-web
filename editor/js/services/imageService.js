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