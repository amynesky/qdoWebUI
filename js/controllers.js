'use strict';

/* Controllers */
var epbControllers = angular.module('qdControllers', []);

/*
function MyController($scope) {
  $scope.username = '';

  $scope.sayHello = function() {
    $scope.greeting = 'Hello ' + $scope.username + '!';
  };
}
*/

/* controller for homepage */
epbControllers.controller('homeCtrl', function ($scope, $rootScope, $location, $cookieStore, localStorageService, Auth) {

        $scope.newPage = function (){
          try{
            if(!$rootScope.token){ /*if you don't already have a token stored in the cookie, get one*/
              var token = Auth.setCredentials($scope.username, $scope.password).success(function(data, status, headers, config) {
                token = data.token;
                var expiration = data.expires;
                //$cookieStore.put("token", token); /*store the new token in a cookie*/
                localStorageService.set("token", {  /*store the token locally*/
                  "username": $scope.username, 
                  "password": $scope.password, 
                  "token": token, 
                  "expiration" : expiration
                });
                $rootScope.token = token;
                $rootScope.success = true;
                $location.path( '/home/' + $scope.username );
              });
            }else{
              $rootScope.success = true;
              $location.path( '/home/' + $scope.username );
            };
          }catch(err){
            console.log("error occured.");
            $rootScope.success = false;
            //$scope.usernameError();
          }
        };

        //$scope.usernameError = function (){
          //if($scope.success == false){
            $scope.error = "Whoops! Please try logging in again." ;
          //}
        //};



});

/* controller for userhome */
epbControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService) {
       
        $scope.username = $stateParams.username;
        var queues = QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
          $scope.queues = data.queues; 
          var pointer = 0;
          for ( var i=0; i < data.queues.length; i++) { 
            pointer += 1;
          };
        
          $scope.nqueues = pointer; /*number of queues*/

          $scope.ntasks = function(queue) {
              var totaltasks = 0;
              for ( var state in queue["ntasks"]) {      
                totaltasks += queue["ntasks"][state];
              };
              return totaltasks;
          };
          
          $scope.percent = function(queue, status) {
              var totaltasks = $scope.ntasks(queue);
              if (totaltasks > 0){
                return 100.0 * queue["ntasks"][status] / totaltasks;
              }else{
                return 0;
              };
          };
          $scope.succeeded = function(queue) {return $scope.percent(queue, "Succeeded") == 100;};
          $scope.failed = function(queue) {return $scope.percent(queue, "Failed") > 0;};
          $scope.inProgress = function(queue) {return !$scope.succeeded(queue) && !$scope.failed(queue) && $scope.ntasks(queue) > 0;};
        });

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
          });
        };


        
    });








/* controller for queuepage */
epbControllers.controller('queueCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory) {
       
        $scope.username = $stateParams.username;
        $scope.queuename = $stateParams.queuename;
        var queues = QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
        //var queues = QueueFactory.query({"username": $scope.username});
        //queues.$promise.then(function(data){
          $scope.queues = data.queues;
          for ( var i=0; i < data.queues.length; i++) { 
            if(data.queues[i]["name"] == $scope.queuename){     
              var pointer = i;     //assumes no two queues have the same name
            };
          };
          $scope.queue = data.queues[pointer]; 

          $scope.ntasks = function(queue) {
              var totaltasks = 0;
              for ( var state in queue["ntasks"]) {      
                totaltasks += queue["ntasks"][state];
              };
              return totaltasks;
          };
          
          $scope.percent = function(queue, status) {
              var totaltasks = $scope.ntasks(queue);
              if (totaltasks > 0){
                return 100.0 * queue["ntasks"][status] / totaltasks;
              }else{
                return 0;
              };
          };
          $scope.succeeded = function(queue) {return $scope.percent(queue, "Succeeded") == 100;};
          $scope.failed = function(queue) {return $scope.percent(queue, "Failed") > 0;};
          $scope.inProgress = function(queue) {return !$scope.succeeded(queue) && !$scope.failed(queue) && $scope.ntasks(queue) > 0;};
        });

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
          });
        };

        $scope.pause = function(){
          console.log("attemping to pause " + $scope.queuename + "queue.");
          QueueFactory.pause($scope.username, $scope.queuename);
        };

        $scope.goToUserhomePage = function(){
              $location.path( '/home/' + $scope.username );
        };

    });
