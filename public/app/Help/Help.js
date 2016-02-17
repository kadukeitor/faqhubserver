"use strict";

angular
    .module('help', [])

    .config(function ($stateProvider) {

        $stateProvider
            .state('base.help', {
                url: "/help",
                cache: false,
                views: {
                    "base": {
                        templateUrl: "app/Help/Help.html",
                        controller: 'HelpCtrl'
                    }
                }
            })

    });
