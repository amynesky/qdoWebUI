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
epbControllers.controller('homeCtrl', function ($scope, $rootScope, $location) {

        $scope.newPage = function (){
          $location.path( '/home/' + $scope.username );
        };

});

/* controller for userhome */
epbControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory) {
       
        $scope.username = $stateParams.username;
        var queues = QueueFactory.query({"username": $scope.username});
        queues.$promise.then(function(data){
          $scope.queues = data.queues; 
        });
      
      $scope.percent = function(queue, status) {
          var totaltasks = 0;
          for ( var state in queue["ntasks"]) {      
            totaltasks += queue["ntasks"][state];
          };
          if (totaltasks > 0){
            return 100.0 * queue["ntasks"][status] / totaltasks;
          }else{
            return 0;
          };
      };
      $scope.succeeded = function(queue) {return $scope.percent(queue, "Succeeded") == 100;};
      $scope.failed = function(queue) {return $scope.percent(queue, "Failed") > 0;};
      $scope.inProgress = function(queue) {return !$scope.succeeded(queue) && !$scope.failed(queue);};

        
    });




/* controller for queuepage */
epbControllers.controller('queueCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory) {
       
        $scope.username = $stateParams.username;
        $scope.queuename = $stateParams.queuename;
        var queues = QueueFactory.query({"username": $scope.username});
        queues.$promise.then(function(data){
          $scope.queues = data.queues;
          for ( var i=0; i < data.queues.length; i++) { 
            if(data.queues[i]["name"] == $scope.queuename){     
              var pointer = i;     //assumes no two queues have the same name
            };
          };
          $scope.queue = data.queues[pointer]; 
        });
        
        $scope.percent = function(queue, status) {
          var totaltasks = 0;
          for ( var state in queue["ntasks"]) {      
            totaltasks += queue["ntasks"][state];
          };
          if (totaltasks > 0){
            return 100.0 * queue["ntasks"][status] / totaltasks;
          }else{
            return 0;
          };
        };
        $scope.succeeded = function(queue) {return $scope.percent(queue, "Succeeded") == 100;};
        $scope.failed = function(queue) {return $scope.percent(queue, "Failed") > 0;};
        $scope.inProgress = function(queue) {return !$scope.succeeded(queue) && !$scope.failed(queue);};
    });
