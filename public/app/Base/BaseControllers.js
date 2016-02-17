'use strict';

angular
    .module('base')
    .controller('BaseCtrl', BaseCtrl);

function BaseCtrl($scope, $state, $auth, LoginSvc) {

    LoginSvc
        .getProfile()
        .then(function (profile) {
            $scope.profile = profile.data;
        });

    $scope.logout = function () {
        if (!$auth.isAuthenticated()) {
            return;
        }
        $auth.logout()
            .then(function () {
                $state.go('login');
            });
    };

    $scope.goToClient = function () {
        $state.go('client');
    };

    $scope.goToHelp = function () {
        $state.go('base.help');
    };

}
