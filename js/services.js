'use strict'

var qdoServices = angular.module('qdoServices', ['ngResource']);





qdoServices.factory('Auth', ['$base64', '$cookieStore', '$http', function ($base64, $cookieStore, $http) {
    // initialize to whatever is in the cookie, if anything
    //$http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
 
    return {
        setCredentials: function (username, password) {
            return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/token', 
              headers: {'Authorization': 'Basic '+ $base64.encode(username + ':' + password)}
            });
        },
    };
}]);


//retrieves the qdo queues
qdoServices.factory('QueueFactory', ['$base64', '$rootScope', '$http', function ($base64, $rootScope, $http) {
  return {
      getQueues: function (username) {
          //console.log($rootScope.token);
          return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/', 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },
      getQueue: function (username, queuename) {
          //console.log($rootScope.token);
          return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename, 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },
      getQueueTaskDetails: function(username, queuename){
            //console.log($rootScope.token);
          //console.log('http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename + "/tasks/");
            return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename + "/tasks/", 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"),               },
            });
      },
      pause: function(username, queuename){
          return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename, 
              data : 'state=Paused',
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },     
          });       
      },
      resume: function(username, queuename){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename, 
              data : 'state=Active',
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      retry: function(username, queuename){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename + '/retry', 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      rerun: function(username, queuename){
           return $http({
              method: 'PUT', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename + '/rerun', 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      deleteQueue: function(username, queuename){
           return $http({
              method: 'DELETE', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename, 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      createQueue: function(username, queuename){
           return $http({
              method: 'POST', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename, 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      addTask: function(username, queuename, task, priority){
            console.log(task);
            console.log(priority);
           return $http({
              method: 'POST', 
              url: 'http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename + "/tasks/", 
              //data : 'task=' + task,
              //data : 'priority=' + priority, // tried just adding a second data entry
              //data : 'task=' + task + ', priority=' + priority,
              //data : {'task' : task, 'priority' : priority},
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
  }
}]);










//intercepts 401 responses and redirects to the login page
qdoServices.factory('httpInterceptor', function httpInterceptor ($q, $window, $location) {
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

//adds the auth token to all API calls
qdoServices.factory('api', function ($http, $cookies) {
  return {
      init: function (token) {
          $http.defaults.headers.common['X-Access-Token'] = token || $cookies.token;
      }
  };
});


//calls the API to login
qdoServices.factory('authorization', function ($http) {
  return {
      login: function (credentials) {
          return $http.post('http://0.0.0.0:8080/api/v1/token', credentials);
      },
      logout: function () {
          return $http.post('/epb/admin/user/logout');
      }
  };
});
