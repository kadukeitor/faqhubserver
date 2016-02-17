"use strict";

angular
    .module('base', [])

    .config(function ($stateProvider) {

        $stateProvider
            .state('base', {
                url: "/base",
                templateUrl: "app/Base/Base.html",
                controller: 'BaseCtrl',
                resolve: {
                    loginRequired: loginRequired
                }
            });

        function loginRequired($q, $location, $auth) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                deferred.resolve();
            } else {
                $location.path('/login');
            }
            return deferred.promise;
        }

    })
;
