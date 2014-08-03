//This file contains all javascript helper functions specific to each html template

'use strict';

/* Controllers allow you make javascript helper functions */
var qdoControllers = angular.module('qdoControllers', []);

//think of $scope as global variables/functions for a given page template
//think of $rootScope variables/functions as global variables across all templates
// $stateParams are parts of url that are stored in variables


/* controller for home/log in page */
//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
qdoControllers.controller('homeCtrl', function ($scope, $rootScope, $location, localStorageService, Auth) { //localstorage is an angularjs library, Auth is a set of service functions

        $scope.logIn = function (){
            //think of $scope as global variables for a given page template, username and password were stored in the scope by the nd-model directive
            var token = Auth.setCredentials($scope.username, $scope.password).success(function(data, status, headers, config) {
                //if Auth.setCredentials is successful, do the following
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
            }).error(function(data, status, headers, config) { //if Auth.setCredentials fails, do the following
                $rootScope.credentialsAuthorized = false;
            });
        };


        $scope.error = "Whoops! Please try logging in again." ;

});





/* controller for userhome */
qdoControllers.controller('userhomeCtrl', //'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queues) {
        //QueueFactory is a set of service functions
        // localStorageService is an angularjs library
        // queues variable was declared in qdoApp.js
        //think of $scope as global variables/functions for a given page template
        //think of $rootScope variables/functions as global variables across all templates
        // $stateParams are parts of url that are stored in variables
       
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
            // Queuefactory is a set of service.js functions
            QueueFactory.createQueue($scope.username, $scope.newQueueName).success(function(data, status, headers, config) {
                //if createQueue is successful do this
                QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
                    //if getQueues is successful do this
                        $rootScope.queues = data.queues;//remember to update the queues variable so the page live updates
                });
            });
        };




        
    });





/* controller for Delete Modal Window */
//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
qdoControllers.controller('deleteQueueController', function($scope, $rootScope, $stateParams, QueueFactory, ngDialog) {
    //QueueFactory is a set of service functions
    //think of $scope as global variables/functions for a given page template
    //think of $rootScope variables/functions as global variables across all templates
    // $stateParams are parts of url that are stored in variables
    // ngDialog ia an angularjs library pertaining to popup dialog windows

    $scope.username = $stateParams.username;

    $scope.deleteQueue = function(queuename){
        QueueFactory.deleteQueue($scope.username, queuename).success(function(data, status, headers, config) {
            //if deleteQueue is successful do the following
            QueueFactory.getQueues($scope.username).success(function(data, status, headers, config) {
                //if getQueues is successful do the following
                $rootScope.queues = data.queues;//remember to update the queues variable so the page live updates
                ngDialog.close();//close dialog window
            });

        });
    };

        $scope.closeDeleteModal = function () {
            ngDialog.close();
        };

});




/* controller for queuepage */
qdoControllers.controller('queueCtrl', //'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queue, queueTaskDetails) {
        //QueueFactory is a set of service functions
        // localStorageService is an angularjs library
        // queue variable was declared in qdoApp.js
        // queueTaskDetails variable was declared in qdoApp.js
        //think of $scope as global variables/functions for a given page template
        //think of $rootScope variables/functions as global variables across all templates
        // $stateParams are parts of url that are stored in variables
       
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
                //if pause is successful do the following
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    //if getQueue is successful then remember to do a update of variables so the page loads lives
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    //if getQueueTaskDEtails is successful then remember to do a update of variables so the page loads lives
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };

        //NOTE: resume, retry, rerun, addTask all call Service funcions and behave similarly to $scope.pause function, please refer to those notes
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

        $scope.newPriority = function(){
            if($scope.priority){
                $scope.newPriority = $scope.priority; //$scope.priority was declared by an ng-model call in queue.html
            }else{
                $scope.newPriority = 0
            };
        };

        $scope.addTask = function () {
            $scope.newPriority();
            QueueFactory.addTask($scope.username, $scope.queuename, $scope.newTask, $scope.newPriority).success(function(data, status, headers, config) {
                QueueFactory.getQueue($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queue = data;
                });
                QueueFactory.getQueueTaskDetails($scope.username, $scope.queuename).success(function(data, status, headers, config) {
                    $scope.queueTaskDetails = data.tasks;
                });
            });
        };


});
