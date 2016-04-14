'use strict';

var eswEditor = angular.module('eswEditor', [
    'ui.ace',
    'ui.bootstrap',
    'ui.bootstrap.modal'
]);

eswEditor.controller('MainController', function ($scope, $http) {
    $scope.text = '';
    $scope.postInfo = '';
});