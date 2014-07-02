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
  'ngSanitize'
]).run(
      [ '$rootScope', '$state', '$stateParams', '$cookies',
      function ($rootScope,   $state,   $stateParams, $cookies) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        //navigation template locations
        $rootScope.navPath = "./partials/navigations/nav.html";

      }]);

qdoApp.run(function (api) {
   api.init();
});

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
/*
qdoApp.config(['$httpProvider', function ($httpProvider) {
  //Reset headers to avoid OPTIONS request (aka preflight)
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};

}]);
*/


qdoApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])


