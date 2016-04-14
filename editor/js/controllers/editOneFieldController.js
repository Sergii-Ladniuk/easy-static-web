eswEditor.controller('EditOneFieldController', function($scope, args) {
    $scope.args = args;
    $scope.ok = function() {
        var result = $scope.result;
        $scope.$close(result);
    }
});