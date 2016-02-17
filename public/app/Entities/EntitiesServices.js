'use strict';

angular
    .module('entities')
    .factory('EntitiesSvc', EntitiesSvc)
    .factory('EntitiesItemsSvc', EntitiesItemsSvc);

function EntitiesSvc($q, $http) {

    return {

        create: function (model) {

            var deferred = $q.defer();

            $http
                .post('cloudant/entities', model)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },

        delete: function (id) {

            var deferred = $q.defer();

            $http
                .delete('cloudant/entities/' + id)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },
        read: function () {

            var deferred = $q.defer();

            $http
                .get('cloudant/entities')
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },
        readById: function (id) {

            var deferred = $q.defer();

            $http
                .get('cloudant/entities/' + id)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },
        update: function (id, model) {

            var deferred = $q.defer();

            $http
                .put('cloudant/entities/' + id, model)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        }
    }

}

function EntitiesItemsSvc($q, $http) {

    return {

        create: function (model) {

            var deferred = $q.defer();

            $http
                .post('cloudant/items', model)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },

        delete: function (id) {

            var deferred = $q.defer();

            $http
                .delete('cloudant/items/' + id)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },
        read: function () {

            var deferred = $q.defer();

            $http
                .get('cloudant/items')
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },
        readById: function (id) {

            var deferred = $q.defer();

            $http
                .get('cloudant/items/' + id)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        },
        update: function (id, model) {

            var deferred = $q.defer();

            $http
                .put('cloudant/items/' + id, model)
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

        }
    }

}