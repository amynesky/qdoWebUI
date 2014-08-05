//Think of this file as full of helper javaScript functions for the controller functions. 
//This is where you make javaScript functions that call other pages. GETs, PUTs, POSTs, DELETEs...etc.
//these functions are not specific to any particular html template and are called in controllers.js
//NOTE: $http is a special angularjs object

'use strict'

var qdoServices = angular.module('qdoServices', ['ngResource']);

//retrieves the host.json file which you can manually edit to change the host of the api
qdoServices.factory('HostFactory', function ($resource) {
        return $resource('./config/apiHost.json', {}, {
        query: { method: 'GET' },
    })

});



//Auth deals with logging in
//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
qdoServices.factory('Auth', ['$base64', '$rootScope', '$http', function ($base64, $rootScope, $http) {
    return {
        setCredentials: function (username, password) {
            return $http({
              method: 'GET', 
              url:  $rootScope.apiHost + '/api/v1/token', 
              headers: {'Authorization': 'Basic '+ $base64.encode(username + ':' + password)}
            });
        },
    };
}]);


//QueueFactory functions retrieve the qdo queues and manipulate them
//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
qdoServices.factory('QueueFactory', ['$base64', '$rootScope', '$http', function ($base64, $rootScope, $http) {
  return {
      getQueues: function (username) {
          //console.log($rootScope.token);
          return $http({
              method: 'GET', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/', 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },
      getQueue: function (username, queuename) {
          //console.log($rootScope.token);
          return $http({
              method: 'GET', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename, 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password")}
            });
      },
      getQueueTaskDetails: function(username, queuename){
            //console.log($rootScope.token);
          //console.log('http://0.0.0.0:8080/api/v1/' + username + '/queues/' + queuename + "/tasks/");
            return $http({
              method: 'GET', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename + "/tasks/", 
              headers: {'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"),               },
            });
      },
      pause: function(username, queuename){
          return $http({
              method: 'PUT', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename, 
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
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename, 
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
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename + '/retry', 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      rerun: function(username, queuename){
           return $http({
              method: 'PUT', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename + '/rerun', 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      deleteQueue: function(username, queuename){
           return $http({
              method: 'DELETE', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename, 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      createQueue: function(username, queuename){
           return $http({
              method: 'POST', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename, 
              headers: {
                'Authorization': 'Basic '+ $base64.encode($rootScope.token + ':' + "not_a_valid_password"), 
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            });
      },
      addTask: function(username, queuename, task, priority){
           return $http({
              method: 'POST', 
              url: $rootScope.apiHost + '/api/v1/' + username + '/queues/' + queuename + "/tasks/", 
              data : 'task=' + task + "&priority=" + priority,
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


