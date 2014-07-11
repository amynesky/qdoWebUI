'use strict';

/* App Module */

var qdoApp = angular.module('qdoApp', [
  'qdControllers',
  'qdServices',
  'ui.router',
  'ui.bootstrap',
  'ui.select2',
  'ngCookies',
  'base64',
  'LocalStorageModule',
  'ngSanitize'
]).run(
      [ '$rootScope', '$state', '$stateParams', '$cookies', 'localStorageService', 
      function ($rootScope,   $state,   $stateParams, $cookies, localStorageService) {

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
        //if($cookies && $cookies.token){
          //$rootScope.token = $cookies.token.replace(/\"/g,"");
            $rootScope.token = localStorageService.get("token")["token"];
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
                  console.log("error occured.");
                  $rootScope.credentialsAuthorized = false;
                  $location.path( '/home' );
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared cookie from local storage");
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
          
          queues: ['$q', 'QueueFactory', '$stateParams', '$rootScope', '$location', 'localStorageService', function($q, QueueFactory, $stateParams, $rootScope, $location, localStorageService){
            $rootScope.loading = true;
              var d = $q.defer();
 
               QueueFactory.getQueues($stateParams.username).success(function(data, status, headers, config) {
                  d.resolve(data.queues);
                  $rootScope.loading = false;
               }).error(function(data, status, headers, config) {
                  console.log("error occured.");
                  $rootScope.credentialsAuthorized = false;
                  $location.path( '/home' );
                  $rootScope.$on("$locationChangeSuccess", function(event) { 
                      localStorageService.remove("token");
                      console.log("cleared cookie from local storage");
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


