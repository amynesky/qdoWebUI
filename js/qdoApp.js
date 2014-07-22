'use strict';

/* qdoApp Module */

var qdoApp = angular.module('qdoApp', [
  'qdoControllers',
  'qdoServices',
  'qdoDirectives',
  'ui.router',
  'ui.bootstrap',
  'ui.select2',
  'ngCookies',
  'base64',
  'ngDialog',
  'LocalStorageModule',
  'ngSanitize'
]).run(
      [ '$rootScope', '$state', '$stateParams', 'localStorageService', 
      function ($rootScope,   $state,   $stateParams, localStorageService) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        //navigation template locations
        $rootScope.navPath = "./partials/navigations/nav.html";

        /*check to see that you already have a token for the day*/
        var currentDate = new Date();
        currentDate = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + currentDate.getDay()  + " " 
                      + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() 
                      + "." + currentDate.getMilliseconds();
        currentDate = Date.parse(currentDate);                   
        if(localStorageService.get("token") && Date.parse(localStorageService.get("token")["expiration"]) > currentDate){ 
            $rootScope.token = localStorageService.get("token")["token"];
            console.log("grabbing token from local storage");
        }

        $rootScope.credentialsAuthorized = true;
        $rootScope.loading = false;


      }]);




// client side routing
qdoApp.config(function($stateProvider, $urlRouterProvider, $httpProvider){

  $httpProvider.responseInterceptors.push('httpInterceptor');

  
  // For any unmatched url, send to /home
  $urlRouterProvider.otherwise("/home")
  
  $stateProvider
    .state('home', {
        url: "/home",
        templateUrl: "partials/home.html",
        controller: 'homeCtrl',
    })
    .state('userhome', {
        url: "/home/:username",
        templateUrl: "partials/userhome.html",
        controller: 'userhomeCtrl',

        resolve: {
          
          queues: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
              $rootScope.loading = true;
              var d = $q.defer();
              
              QueueFactory.getQueues($stateParams.username).success(function(data, status, headers, config) {
                  d.resolve(data.queues);
                  $rootScope.loading = false;
              }).error(function(data, status, headers, config) {
                  console.log("error: could not retreive queues.");
                  $rootScope.credentialsAuthorized = false;
                  $rootScope.loading = false;
                  $location.path( '/home' );
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared token from local storage");
                  });
              });
               return d.promise;
           }]
        }
    })
    .state('queue', {
        url: "/home/:username/:queuename",
        templateUrl: "partials/queue.html",
        controller: 'queueCtrl',
        resolve: {
          
          queue: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
            $rootScope.loading = true;
              var d = $q.defer();
 
               QueueFactory.getQueue($stateParams.username, $stateParams.queuename).success(function(data, status, headers, config) {
                  d.resolve(data);
                  $rootScope.loading = false;
               }).error(function(data, status, headers, config) {
                  console.log("error: could not retreive queue.");
                  $rootScope.credentialsAuthorized = false;
                  $rootScope.loading = false;
                  $location.path( '/home' );
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared token from local storage");
                  });
              });
               return d.promise;
           }],

          queueTaskDetails: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
            $rootScope.loading = true;
              var d = $q.defer();
 
               QueueFactory.getQueueTaskDetails($stateParams.username, $stateParams.queuename).success(function(data, status, headers, config) {
                  d.resolve(data.tasks);
                  $rootScope.loading = false;
               }).error(function(data, status, headers, config) {
                  console.log("error: could not retreive queue task details.");
                  $rootScope.credentialsAuthorized = false;
                  $rootScope.loading = false;
                  $location.path( '/home' );
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared token from local storage");
                  });
              });
               return d.promise;
           }]


        }
    })
    
});



qdoApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

