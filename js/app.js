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

        $rootScope.success = true;

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
        controller: 'homeCtrl'
    })
    .state('userhome', {
        url: "/home/:username",
        templateUrl: "partials/userhome.html",
        controller: 'userhomeCtrl'
    })
    .state('queue', {
        url: "/home/:username/:queuename",
        templateUrl: "partials/queue.html",
        controller: 'queueCtrl'
    })
    
});



qdoApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])


