'use strict'

var qdServices = angular.module('qdServices', ['ngResource']);

//adds the auth token to all API calls
qdServices.factory('api', function ($http, $cookies) {
  return {
      init: function (token) {
          $http.defaults.headers.common['X-Access-Token'] = token || $cookies.token;
      }
  };
});


//calls the API to login
qdServices.factory('authorization', function ($http) {
  return {
      login: function (credentials) {
          return $http.post('/epb/api/authorize', credentials);
      },
      logout: function () {
          return $http.post('/epb/admin/user/logout');
      }
  };
});

//intercepts 401 responses and redirects to the login page
qdServices.factory('httpInterceptor', function httpInterceptor ($q, $window, $location) {
  return function (promise) {
      var success = function (response) {
          return response;
      };

      var error = function (response) {
          if ((response.status === 401)|| (response.status === 403)) {
              $location.url('/login');
          }

          return $q.reject(response);
      };

      return promise.then(success, error);
  };
});

//for pulling a list of projects and creating a new project
qdServices.factory('ProjectsFactory', function ($resource) {
        //return $resource('http://doright.lbl.gov/epb/api/allprojects.json', {}, {
        return $resource('/epb/api/allprojects.json', {}, {
        query: { method: 'GET' },
        create: { method: 'POST' }
    })
});


//retrieves the metadata file for building forms
qdServices.factory('MetaDataFactory', function ($resource) {
        return $resource('./data/form-meta.json', {}, {
        query: { method: 'GET' },
    })

});



//retrieves and updates a single project
qdServices.factory('ProjectFactory', function ($resource) {
   //return $resource('http://doright.lbl.gov/epb/api/project/:id.json', {}, {
    return $resource('/epb/api/project/:id.json', {}, {
        show: { method: 'GET' },
        update: { method: 'PUT',
            params: {
                id: "@id"
            } 
        },
        delete: { method: 'DELETE', params: {id: "@id"} }
    })  
});


//used to delete an ECM from a project
qdServices.factory('ProjectECMFactory', function ($resource) {
    return $resource('/epb/api/delete_ecm/:id/:ecmid', {}, {
        delete: { method: 'GET', params: {id: '@id', ecmid: '@ecmid'} }
    })
});


