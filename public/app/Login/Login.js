"use strict";

angular
    .module('login', [])

    .config(function ($stateProvider) {

        function skipIfLoggedIn($q, $auth) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                deferred.reject();
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "app/Login/Login.html",
                controller: 'LoginCtrl',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })

    })
;
