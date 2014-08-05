Hello!

About qdo:
qdo (kew-doo) is a lightweight high-throughput queuing system for workflows that have many small tasks to perform. It is designed for situations in which the number of tasks to perform is much larger than the practical limits of the underlying batch job system. Its interface emphasizes simplicity while maintaining flexibility. Enjoy!


Editing this interface:
This web interface is built using AngularJS, a JavaScript library that extends HTML vocabulary for building dynamic web applications (for more, see angularjs.org).  AngularJS  compartmentalizes code to organize the building process. To edit this interface, you’ll most often need to edit code in all of the following files (since they’re all linked!)

HTML:
qdo.html
	 - Parent html file: this file contains the html code for the main page. Any code here pertains to all child templates
/partials/home.html
	 - html temlpate for the login page, an introduction to qdo. child html template or 'partial html'
/partials/userhome.html
	 - html template for the user home page displaying a list of all the queues. child html template or 'partial html'
/partials/queue.html
	 - html template for the queue details page. child html template or 'partial html'

JavaScript:
/js/qdoApp.js
	 - This is the main/parent javascript file, Think of this file as the conductor for all the other javascript files
	 - tell your app about all the different templates, their urls and their controllers are in this file
/js/controllers.js
	 - This file contains all javascript helper functions specific to each html template
/js/services.js
	 - Think of this file as full of helper javaScript functions for the controller functions. 
	 - This is where you make javaScript functions that call other pages. GETs, PUTs, POSTs, DELETEs...etc.
	 - these functions are not specific to any particular html template and are called in controllers.js
/js/directives.js
	 - directives are markers on a DOM element that tell AngularJS's HTML compiler to attach a 
	 - specified behavior to that DOM element or even transform the DOM element and its children
/js/queueTaskDetailsDataTable.js
	 - This file contains DataTables Javascript for the queueTaskDetails table on the queue details page

CSS:
/css/styles.css
	 - this is the personalized stylesheet




Worked Example: Building the home.html partial page

first tell your app about your new page in the adoApp.js file with the following code:

  $stateProvider
    .state('home', {
        url: "/home",
        templateUrl: "partials/home.html",
        controller: 'homeCtrl',
    })

This tells the app that to use the home.html template at the url /home and that this template with use the helper functions found in the homeCtrl controller in the controllers.js file. Now you’re free to start coding some html.  If you’re making a complex page that needs helper functions, make your helper functions in the controllers.js file within the curly brackets of the homeCtrl controller.

qdoControllers.controller('homeCtrl', function ($scope, $rootScope, $location, localStorageService, Auth) { 
…

});

Remember to ‘inject' all kinds of objects you are going to use, $scope, $rootScope etc.., when building a new controller.  Think of this as giving angularJS a heads up. Functions inside a template-specific controller in controllers.js can be called appropriately in the corresponding html template.

If you need to do any POSTing, GETing, PUTing, or DELETEing, build those functions as a service function in services.js.  Services are not template specific and can only be called in the controllers.js file. Any controller can call a service function.



Adding content:

home.html looks like this:

<h1>Welcome to qdo!</h1>
   <p class="lead"> qdo (kew-doo) is a lightweight high-throughput queuing system for workflows that have many small tasks to perform. It is designed for situations in which the number of tasks to perform is much larger than the practical limits of the underlying batch job system. Its interface emphasizes simplicity while maintaining flexibility. Enjoy! </p>

   
<form ng-submit="">
	<div>
	  Username:
	    <input type="text" ng-model="username"> 
	</div>
	<div style="margin-top:5px;">
	  <span style="margin-right:3px;">Password:</span>
	    <input type="password" ng-model="password"> 
	    <button class="glyphicon text" ng-click="logIn()" >Log in</button> 
	    <p ng-if="!credentialsAuthorized" class="failed" style="margin-top:3px;"> {{error}}</p>
	</div>
</form>

ng-submit is an angularjs directive that allows an input element to do the action value or the action caused by clicking on the button inside the form html tags when pressing the enter key.  In this case, the action attached to the button, using the angular ng-click directive, inside the form tags is logIn().  logIn() can be found in the homeCtrl controller in controllers.js:

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

logIn() is a $scope function, which one can think of a function specific to the corresponding template (other templates will not recognize this function).  logIn() makes a called to the setCredentials function inside the Auth service in the services.js file:

qdoServices.factory('Auth', ['$base64', '$cookieStore', '$http', function ($base64, $cookieStore, $http) {
    return {
        setCredentials: function (username, password) {
            return $http({
              method: 'GET', 
              url: 'http://0.0.0.0:8080/api/v1/token', 
              headers: {'Authorization': 'Basic '+ $base64.encode(username + ':' + password)}
            });
        },
    };
}]);

Notice that $scope.username and $scope.password are passed in to the setCredentials function.  In home.html, the ng-model angularjs directive stored the input values in these $scope variables. If setCredentials is successful, logIn() will store the resulting token in local storage and redirect the page to the base url + '/home/' + $scope.username (which has its own template and controllers). If successful, logIn() will also set a few $rootScope variables to ‘true’.  $rootScope functions and variables are global across all templates.  In particular, $rootScope.credentialsAuthorized = true, upon success.  This global variable was initialed as true when the app first loaded in qdoApp.js:

var qdoApp = angular.module('qdoApp', [ //tell quoApp about any javascript modules (directives, controllers, services) here:
  'qdoControllers',
  'qdoServices',
  'qdoDirectives',
  'ui.router',
  'ui.bootstrap',
  'ui.select2',
  'ngCookies',
  'base64',
  'ngDialog',
  'LocalStorageModule',
  'ngSanitize'
]).run(//'inject' all kinds of objects you are going to use, think of this as giving angularJS a heads up.
      [ '$rootScope', '$state', '$stateParams', 'localStorageService', 
      function ($rootScope,   $state,   $stateParams, localStorageService) { //localstorage is an angularjs library 
     

        $rootScope.credentialsAuthorized = true;



      }]);


Should credentialsAuthorized become false, which occurs when the setCredentials service function fails, home.html will display the error, "Whoops! Please try logging in again.” in the following element:

<p ng-if="!credentialsAuthorized" class="failed" style="margin-top:3px;"> {{error}}</p>

ng-if is an angularjs directive that will hide or show the html element based on the value given.  {{error}} corresponds to the $scope variable, $scope.error = "Whoops! Please try logging in again." in the homeCtrl controller in controllers.js.

