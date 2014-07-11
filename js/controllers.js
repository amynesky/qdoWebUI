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

        $scope.logIn = function (){
            //if(!$rootScope.token){ /*if you don't already have a token stored in the cookie, get one*/
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
                $rootScope.credentialsAuthorized = true;
                $location.path( '/home/' + $scope.username );
            }).error(function(data, status, headers, config) {
                console.log("error occured.");
                $rootScope.credentialsAuthorized = false;
            });
        };


        $scope.error = "Whoops! Please try logging in again." ;
        


});

/* controller for userhome */
epbControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queues) {
       
        $scope.username = $stateParams.username;
        //var queues = QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
          //$scope.queues = data.queues; 
          $scope.queues = queues;
          var pointer = 0;
          for ( var i=0; i < queues.length; i++) { 
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
        //});

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            console.log("cleared cookie from local storage");
            localStorageService.remove("token");
          });
        };


        
    });








/* controller for queuepage */
epbControllers.controller('queueCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queues) {
       
        $scope.username = $stateParams.username;
        $scope.queuename = $stateParams.queuename;
        //var queues = QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
        //var queues = QueueFactory.query({"username": $scope.username});
        //queues.$promise.then(function(data){
          $scope.queues = queues;
          for ( var i=0; i < queues.length; i++) { 
            if(queues[i]["name"] == $scope.queuename){     
              var pointer = i;     //assumes no two queues have the same name
            };
          };
          $scope.queue = queues[pointer]; 

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
        //});

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
            console.log("cleared cookie from local storage");
          });
        };

        $scope.pause = function(){
          console.log("attemping to PAUSE ");
          console.log("before:" + $scope.queue["state"]);
          QueueFactory.pause($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                $scope.queue["state"] = "Paused";
                console.log("after pause: " + $scope.queue["state"]);
          });
        };

        $scope.resume = function(){
          console.log("attemping to RESUME");
          console.log("before:" + $scope.queue["state"]);
          QueueFactory.resume($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                $scope.queue["state"] = "Active";
                console.log("after resume: " + $scope.queue["state"]);
          });
        };

        $scope.retry = function(){
          console.log("attemping to RETRY");
          console.log("before:" + $scope.queue["state"]);
          QueueFactory.retry($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                $scope.queue["state"] = "Active"; 
                console.log("after retry: " + $scope.queue["state"]);
          });
        };

        $scope.goToUserhomePage = function(){
              $location.path( '/home/' + $scope.username );
        };

    });
