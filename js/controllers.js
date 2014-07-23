'use strict';

/* Controqdors */
var qdoControllers = angular.module('qdoControllers', []);


/* controller for homepage */
qdoControllers.controller('homeCtrl', function ($scope, $rootScope, $location, localStorageService, Auth) {

        $scope.logIn = function (){
            //if(!$rootScope.token){ /*if you don't already have a token stored in the localStorage, get one*/
            var token = Auth.setCredentials($scope.username, $scope.password).success(function(data, status, headers, config) {
                token = data.token;
                var expiration = data.expires;
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
                $rootScope.credentialsAuthorized = false;
            });
        };


        $scope.error = "Whoops! Please try logging in again." ;

});





/* controller for userhome */
qdoControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queues) {
       
        $scope.username = $stateParams.username;
        $rootScope.queues = queues;
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
        $scope.inProgress = function(queue) {
            if($scope.ntasks(queue)>0){
                return !$scope.succeeded(queue) && !$scope.failed(queue) && $scope.ntasks(queue) > 0;
            }else{
                return true;
            };
        };


        $scope.isActive = function(queue){return queue["state"]=="Active";};
        $scope.isPaused = function(queue){return queue["state"]=="Paused";};

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
          });
        };

        $scope.storeQueueName = function (queuename) {
            $rootScope.queuename = queuename;
        };

        $scope.createQueue = function () {
            QueueFactory.createQueue($scope.username, $scope.newQueueName).success(function(data, status, headers, config) {
                QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
                        $rootScope.queues = data.queues;
                });
            });
        };




        
    });





/* controller for Delete Modal Window */
qdoControllers.controller('deleteQueueController', function($scope, $rootScope, $stateParams, QueueFactory, ngDialog) {

    $scope.username = $stateParams.username;

    $scope.deleteQueue = function(queuename){
        QueueFactory.deleteQueue($scope.username, queuename).success(function(data, status, headers, config) {
            QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
                $rootScope.queues = data.queues;
                ngDialog.close();
            });

        });
    };

        $scope.closeDeleteModal = function () {
            ngDialog.close();
        };

});




/* controller for queuepage */
qdoControllers.controller('queueCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queue, queueTaskDetails) {
       
        $scope.username = $stateParams.username;
        $scope.queuename = $stateParams.queuename;
        $scope.queue = queue;
        $scope.queueTaskDetails = queueTaskDetails;

        $scope.showTaskDetailsTable = false;
        $scope.showHideTaskDetailsTable = function(){
            if($scope.showTaskDetailsTable == false){
                $scope.showTaskDetailsTable = true;
            }else{
                $scope.showTaskDetailsTable = false;
            };
        };

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
        $scope.inProgress = function(queue) {
            if($scope.ntasks(queue)>0){
                return !$scope.succeeded(queue) && !$scope.failed(queue) && $scope.ntasks(queue) > 0;
            }else{
                return true;
            };
        };

        $scope.isActive = function(queue){return queue["state"]=="Active";};
        $scope.isPaused = function(queue){return queue["state"]=="Paused";};

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
          });
        };

        $scope.goToUserhomePage = function(){$location.path( '/home/' + $scope.username );};

        $scope.pause = function(){
            QueueFactory.pause($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };
        $scope.resume = function(){
            QueueFactory.resume($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };
        $scope.retry = function(){
            QueueFactory.retry($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };
        $scope.rerun = function(){
            QueueFactory.rerun($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };

        $scope.addTask = function () {
            QueueFactory.addTask($scope.username, $scope.queuename, $scope.newTask).success(function(data, status, headers, config) {
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };


});
