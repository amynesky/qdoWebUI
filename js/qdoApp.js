'use strict';

/* qdoApp Module */
//This is the main/parent javascript file, Think of this file as the conductor for all the other javascript files\
//tell your app about all the different templates, their urls and their controllers are in this file

var qdoApp = angular.module('qdoApp', [ //tell quoApp about any javascript modules (directives, controllers, services) here:
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
]).run(//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
      [ '$rootScope', '$state', '$stateParams', 'localStorageService', 
      function ($rootScope,   $state,   $stateParams, localStorageService) { //localstorage is an angularjs library 
        //think of $rootScope variables as global variables across all templates
        // $stateParams are parts of url that are stored in variables 

        //upon first load do all of the things below
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
        //localstorage is an angularjs library                   
        if(localStorageService.get("token") && Date.parse(localStorageService.get("token")["expiration"]) > currentDate){ 
            $rootScope.token = localStorageService.get("token")["token"];
            //console.log("grabbing token from local storage");
            //console.log($rootScope.token);
        }

        $rootScope.credentialsAuthorized = true;
        $rootScope.loading = false;


      }]);




// client side routing
qdoApp.config(function($stateProvider, $urlRouterProvider, $httpProvider){//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.

  $httpProvider.responseInterceptors.push('httpInterceptor');

  
  // For any unmatched url, send to /home
  $urlRouterProvider.otherwise("/home")


  //tell angularjs about all the different templates you have here, what their url is and what controller they talk to.
  $stateProvider
    .state('home', {
        url: "/home",
        templateUrl: "partials/home.html",
        controller: 'homeCtrl',
    })
    .state('userhome', {
        url: "/home/:username",//username is a $stateParam
        templateUrl: "partials/userhome.html",
        controller: 'userhomeCtrl',

        resolve: { //resolve tells angularjs to stall loading the template until 'this' stuff has finished
          //'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
          queues: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
              $rootScope.loading = true;
              var d = $q.defer();
              //queuefactory is a set of service functions, getQueues is one of the queuefactory functions
              QueueFactory.getQueues($stateParams.username).success(function(data, status, headers, config) {//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
                  //if the getQueues function is successful.. do the following
                  d.resolve(data.queues);
                  $rootScope.loading = false;
              }).error(function(data, status, headers, config) {//if the getQueues function fails..do the following
                  console.log("error: could not retreive queues.");
                  $rootScope.credentialsAuthorized = false;
                  $rootScope.loading = false;
                  $location.path( '/home' );
                  /*
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared token from local storage");
                  });
                  */
              });
               return d.promise;
           }]
        }
    })
    .state('queue', {
        url: "/home/:username/:queuename",//username and queuename are $stateParams
        templateUrl: "partials/queue.html",
        controller: 'queueCtrl',
        resolve: {//resolve tells angularjs to stall loading the template until 'this' stuff has finished
          
          queue: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
            $rootScope.loading = true;
              var d = $q.defer();
                //queuefactory is a set of service functions, getQueue is one of the queuefactory functions
               QueueFactory.getQueue($stateParams.username, $stateParams.queuename).success(function(data, status, headers, config) {
                //if the getQueues function is successful.. do the following
                  d.resolve(data);
                  $rootScope.loading = false;
               }).error(function(data, status, headers, config) { //if the getQueues function fails..do the following
                  console.log("error: could not retreive queue.");
                  $rootScope.credentialsAuthorized = false;
                  $rootScope.loading = false;
                  $location.path( '/home' );
                  /*
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared token from local storage");
                  });
                  */
              });
               return d.promise;
           }],

          queueTaskDetails: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
            $rootScope.loading = true;
              var d = $q.defer();
                //queuefactory is a set of service functions, getQueueTaskDetails is one of the queuefactory functions
               QueueFactory.getQueueTaskDetails($stateParams.username, $stateParams.queuename).success(function(data, status, headers, config) {
                //if the getQueues function is successful.. do the following
                  d.resolve(data.tasks);
                  $rootScope.loading = false;
               }).error(function(data, status, headers, config) { //if the getQueues function fails..do the following
                  console.log("error: could not retreive queue task details.");
                  $rootScope.credentialsAuthorized = false;
                  $rootScope.loading = false;
                  $location.path( '/home' );
                  /*
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared token from local storage");
                  });
                  */
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


