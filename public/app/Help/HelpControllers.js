'use strict';

angular
    .module('help')
    .controller('HelpCtrl', HelpCtrl);

function HelpCtrl($scope, $state, $http) {

    $http
        .get('cloudant/settings?key=dialog_last_update')
        .then(function (response) {
            $scope.last_update = response.data;
        });

    $scope.back = function () {
        $state.go('base.entities');
    };


}