'use strict';

angular
    .module('login')
    .factory('LoginSvc', LoginSvc);

function LoginSvc($http) {

    return {
        getProfile: function () {
            return $http.get('/auth/me');
        }
    };

}