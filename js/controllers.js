'use strict';

/* Controllers */
var epbControllers = angular.module('qdControllers', []);



/* controller for homepage */
epbControllers.controller('homeCtrl', 
    function ($scope, $rootScope, $location, ProjectFactory) {

        $scope.queue = {};
        $scope.queue.size = 10;
        $scope.queue.complete = 50;

        //an example showing how to call a service with a variable that is within scope
        $scope.update = function () {
          ProjectsFactory.save(project, function success (e) {
            //success callback
            $location.path("project/" + pid + "/projectid");
            
          },
          function error(e){
            //error callback
            }
          );
        }

        //test button callback
        $scope.testClick = function () {
          console.log($scope.queue.complete);
          $scope.queue.complete = 60;
          console.log($scope.queue.complete);

        }

      });

/* controller for userhome */
epbControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location) {
       
        $scope.username = $stateParams.username;
       
      });
