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
          return $http.post('http://0.0.0.0:8080/api/v1/token', credentials);
      },
      logout: function () {
          return $http.post('/epb/admin/user/logout');
      }
  };
});



qdServices.factory('Auth', ['$base64', '$cookieStore', '$http', function ($base64, $cookieStore, $http) {
    // initialize to whatever is in the cookie, if anything
    //$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
 
    return {
        setCredentials: function (username, password) {
            //var encoded = $base64.encode(amynesky + ':' + password);
            //console.log(encoded);
            //$http.defaults.headers.common = {"Access-Control-Request-Headers": "accept, origin, authorization"}; //you probably don't need this line.  This lets me connect to my server on a different domain
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + $base64.encode(username + ':' + password);
            return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/token', 
              headers: {'Authorization': 'Basic '+ $base64.encode(username + ':' + password)}
            });
        },
        clearCredentials: function () {
            document.execCommand("ClearAuthenticationCache");
            $cookieStore.remove('authdata');
            $http.defaults.headers.common.Authorization = 'Basic ';
        }
    };
}]);


//retrieves the qdo queues
qdServices.factory('QueueFactory', ['$base64', '$rootScope', '$http', function ($base64, $rootScope, $http) {
  return {
      getQueues: function (username) {
         return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/', 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },
     
      pause: function(username, queuename){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/' + queuename, 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
              data: {
                state: "Paused",
              }
            });
      },
 /*
      rerun: function(){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/', 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },

      resume: function(){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/', 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },

      retry: function(){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/', 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },
      */
  }
}]);










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

