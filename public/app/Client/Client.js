"use strict";

angular
    .module('client', [])

    .config(function ($stateProvider) {

        $stateProvider
            .state('client', {
                url: "/client",
                cache: false,
                templateUrl: "app/Client/Client.html",
                controller: 'ClientCtrl'
            })

    });
