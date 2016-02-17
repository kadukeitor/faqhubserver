"use strict";

angular
    .module('entities', [])

    .config(function ($stateProvider) {

        $stateProvider
            .state('base.entities', {
                url: "/entities",
                cache: false,
                views: {
                    "base": {
                        templateUrl: "app/Entities/Entities.html",
                        controller: 'EntitiesCtrl'
                    }
                }
            });

        $stateProvider
            .state('base.entity', {
                url: "/entity/:id",
                params: {
                    id: null
                },
                cache: false,
                views: {
                    "base": {
                        templateUrl: "app/Entities/Entity.html",
                        controller: 'EntityCtrl'
                    }
                }
            })

    })
;