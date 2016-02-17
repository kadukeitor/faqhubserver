'use strict';

angular
    .module('login')
    .controller('LoginCtrl', LoginCtrl);

function LoginCtrl($scope, $state, $auth, LoginSvc) {

    $scope.authenticate = function (provider) {
        $auth
            .authenticate(provider)
            .then(function () {
                $state.go('base.entities');
            })
    };

    $scope.client = function (client) {
        if (client == 'web')
            $state.go('client');
        if (client == 'android')
            window.location = 'https://play.google.com/store/apps/details?id=com.ionicframework.faqhub';
    }

}