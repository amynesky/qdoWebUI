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

        $scope.success = true;
        $scope.newPage = function (){
          try{
            if(!$rootScope.token){ /*if you don't already have a token stored in the cookie, get one*/
              var token = Auth.setCredentials($scope.username, $scope.password).success(function(data, status, headers, config) {
                token = data.token;
                //$cookieStore.put("token", token); /*store the new token in a cookie*/
                /*
                var currentdate = new Date(); 
                console.log(currentdate);
                 localStorageService.set($scope.username + "token", {
                  "username": $scope.username, 
                  "passworkd": $scope.password, 
                  "token": token, 
                  "timeObtained" : currentdate
                });
                */
                $rootScope.token = token; 
                $scope.success = true;
                $location.path( '/home/' + $scope.username );
              });
            }else{
              $scope.success = true;
              $location.path( '/home/' + $scope.username );
            };
          }catch(err){
            $scope.success = false;
            //$scope.usernameError();
          }
        };

        //$scope.usernameError = function (){
          //if($scope.success == false){
            $scope.error = "Whoops! There seems to be an issue with the supplied username and/or password." ;
          //}
        //};



});

/* controller for userhome */
epbControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory) {
       
        $scope.username = $stateParams.username;
        var queues = QueueFactory.setCredentials($scope.username).success(function(data, status, headers, config) {
        //var queues = QueueFactory.setCredentials().success(function(data, status, headers, config) {
        //var queues = QueueFactory.setCredentials({"username": $scope.username}).success(function(data, status, headers, config) {
        //var queues = QueueFactory.query({"username": $scope.username});
        //queues.$promise.then(function(data){
          $scope.queues = data.queues; 
          var pointer = 0;
          for ( var i=0; i < data.queues.length; i++) { 
            pointer += 1;
          };
        
          $scope.nqueues = pointer;

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



        
    });








/* controller for queuepage */
epbControllers.controller('queueCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory) {
       
        $scope.username = $stateParams.username;
        $scope.queuename = $stateParams.queuename;
        var queues = QueueFactory.setCredentials($scope.username).success(function(data, status, headers, config) {
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
        

    });
