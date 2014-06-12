'use strict';

/* App Module */

var epbApp = angular.module('qdApp', [
  'qdControllers',
  'qdServices',
  'ui.router',
  'ui.bootstrap',
  'ui.select2',
  'ngCookies',
  'ngSanitize'
]).run(
      [ '$rootScope', '$state', '$stateParams', '$cookies',
      function ($rootScope,   $state,   $stateParams, $cookies) {

        console.log("this is running");

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        //navigation template locations
        $rootScope.navPath = "./partials/navigations/nav.html";

      }]);

// client side routing
epbApp.config(function($stateProvider, $urlRouterProvider, $httpProvider){

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

    .state('projects', {
        url: "/projects",
        templateUrl: "partials/project-table.html",
        controller: 'ProjectTableCtrl',
	      resolve: {
	        users: ['$q', 'UsersFactory', function($q, UsersFactory) {
                   var d = $q.defer();
                   UsersFactory.query(function(users) {
                   /* users returned successfully */
                        d.resolve(users);
                   }, function(err) {
                        /* users failed to load */
                        d.reject(err);
                   });
                   return d.promise;
                }]
        }

    })
    
});



