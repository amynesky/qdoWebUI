'use strict'

var qdServices = angular.module('qdServices', ['ngResource']);

//adds the auth token to all API calls
qdServices.factory('api', function ($http, $cookies) {
  return {
      init: function (token) {
          $http.defaults.headers.common['X-Access-Token'] = token || $cookies.token;
      }
  };
});


//calls the API to login
qdServices.factory('authorization', function ($http) {
  return {
      login: function (credentials) {
          return $http.post('/epb/api/authorize', credentials);
      },
      logout: function () {
          return $http.post('/epb/admin/user/logout');
      }
  };
});

//intercepts 401 responses and redirects to the login page
qdServices.factory('httpInterceptor', function httpInterceptor ($q, $window, $location) {
  return function (promise) {
      var success = function (response) {
          return response;
      };

      var error = function (response) {
          if ((response.status === 401)|| (response.status === 403)) {
              $location.url('/login');
          }

          return $q.reject(response);
      };

      return promise.then(success, error);
  };
});


//retrieves the qdo queues
qdServices.factory('QueueFactory', function ($resource) {
        return $resource('http://0.0.0.0:8080/api/v1/:username\\/', {}, {
        //return $resource('./data/:username.json', {}, {
        query: { method: 'GET', params: {username: '@username'} },
        //query: { method: 'GET' },
        create: { method: 'POST' }
    })

});



