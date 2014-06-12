var epbDirectives = angular.module('epbDirectives', []);


//custom validators

//var INTEGER_REGEXP = /^([0-9]|,)*$/;
//var FLOAT_REGEXP = /^([0-9]|,|\.)*$/;
var INTEGER_REGEXP = /^([0-9]|,)*$/;
var FLOAT_REGEXP = /^([0-9]|\.|,)*$/;
var PERCENT_REGEXP = /^[0-9]*\.?[0-9]{0,2}?$/;

epbDirectives.directive('formatnumeric2', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.fo)(ctrl.$modelValue)
            });

            ctrl.$parsers.unshift(function (viewValue) {
                              
          elem.priceFormat({
            prefix: '',
            suffix: '°',
            centsSeparator: '.',
            thousandsSeparator: ','
        }); 
                return elem[0].value;
            });
        }
    };
}]);
//directive for adding commas to the numeric fields in the form
epbDirectives.directive('formatnumeric', ['$filter', function ($filter) {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, ngModelController) {
        ngModelController.$parsers.push(function(data) {
      		//convert data from view format to model format
      		return data.replace(/,/g,""); //converted
    	});

    	ngModelController.$formatters.push(function(data) {
      		//convert data from model format to view format
		return $filter('number')(data);
      		//return data; //converted
    	});

         //modelCtrl.$parsers.push(capitalize);
         //capitalize(scope[attrs.ngModel]);  // capitalize initial value
     }
   };
}]);


epbDirectives.directive('fieldvalidate', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {

      var field_type = attrs.fielddata;

      ctrl.$parsers.unshift(function(viewValue) {

        //if float 
        if (field_type == 'float') {
            if (FLOAT_REGEXP.test(viewValue)) {
              // it is valid
              ctrl.$setValidity('float', true);
              return viewValue;
            } else {
              // it is invalid, return undefined (no model update)
              ctrl.$setValidity('float', false);
              return undefined;
            }
        } else if (field_type == 'integer') {
            if (INTEGER_REGEXP.test(viewValue)) {
              // it is valid
              ctrl.$setValidity('integer', true);
              return viewValue;
            } else {
              // it is invalid, return undefined (no model update)
              ctrl.$setValidity('integer', false);
              return undefined;
            }
        } 
        else if (field_type == 'dollar') {
            if (INTEGER_REGEXP.test(viewValue)) { //treat like integer
              // it is valid
              ctrl.$setValidity('dollar', true);
              return viewValue;
            } else {
              // it is invalid, return undefined (no model update)
              ctrl.$setValidity('dollar', false);
              return undefined;
            }
        } 
        else if (field_type == 'percent') {
            if (PERCENT_REGEXP.test(viewValue)) { 
                if (viewValue <= 100) {
                  // it is valid
                  ctrl.$setValidity('percent', true);
                  return viewValue;
                 } else {
                   // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('percent', false);
                    return undefined;
                 } 
            } else 
		{
              // it is invalid, return undefined (no model update)
              ctrl.$setValidity('percent', false);
              return undefined;
            }
        } else {
            ctrl.$setValidity('float', true);
            return viewValue;
        }
      });
    }
  };
});
 


epbDirectives.directive('ecmSelect', function() {
    return function(scope, element, attrs) {

        $("#ecm_list").select2({
            placeholder: "Select an ECM",
            allowClear: true
         });
    }
});

epbDirectives.directive('select2', function() {
    return function(scope, element, attrs) {
        $(element).select2({
            allowClear: true
         });
    }
});



//the directive for creating a jquery datatable
epbDirectives.directive('projectTable', function($compile, $rootScope) {
        return function(scope, element, attrs) {

            var options = {
                    "sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
                    "sPaginationType": "bootstrap",
                    "bPaginate": true,
                    "bLengthChange": false,
                    "bFilter": true,
                    "bSort": true,
		                "bRetrieve": true,
                    "bAutoWidth": false,
                    "aaSorting": [[ 1, "desc" ]],
                    "aoColumns": [
                        { "mData": "ProjectID", "sType": "formatted-num"},
                        { "mData": "ProjName"},
                        { "mData": "MarketSegment"},
                        { "mData": "CabinetAgency"},
                        { "mData": "StartYear"},
                        { "mData": "LastModified"},
                        { "mData": "ESCOName"},
                        { "mData": "CustNameOrg"},
                        { "mData": "TotProjImplCost", "sType": "formatted-num"},
                        { "mData": "TotAnnGuarSavings", "sType": "formatted-num"},
                        { "mData": "Stage"},
                        { "mData": "Status"},
                        { "mData": "PercentComplete", "sType": "formatted-num"},
                        { "mData": "ProjectID"}
                    ],
                    "aoColumnDefs": [ //special rendering for the columns
                        {
                            //project ID links to edit project
                            "mRender": function ( data, type, row ) {
                                //change link to review, depending on the user/status
                                //admins can always write
                                if ($rootScope.user.usertype == "Admin") {
                                  return "<a href=\"#project/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                }


                                var project = _.find(scope.projects.project, function(proj){ return proj.ProjectID == row.ProjectID; });
                                
                                var role_obj = _.find(project.user_roles, function(person) { return person.id == $rootScope.user.id });
                                if (role_obj) {
                                  var role = role_obj.role;
                                } else {
                                  return data;
                                }

                                var status = row.Status;

                                if (role == "PI") {
                                  if (status == "Pending") {
                                    return data;
                                  } else if (status == "Pre-Approval") {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  } else {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  }
                                } else if (role == "PB") {
                                  if (status == "Pending") {
                                    return "<a href=\"#project/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  } else {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  }
                                } else if (role == "PV") {
                                  if (status == "Approved") {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  } else {
                                    return data;
                                  }
                                }
                                return data;
                            },
                            "aTargets": [ 0 ]
                        },
                        {
                            //project name links to edit project
                            "mRender": function ( data, type, row ) {
                                //change link to review, depending on the user/status
                                //admins can always write
                                if ($rootScope.user.usertype == "Admin") {
                                  return "<a href=\"#project/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                }

                                
                                var project = _.find(scope.projects.project, function(proj){ return proj.ProjectID == row.ProjectID; });
                                
                                var role_obj = _.find(project.user_roles, function(person) { return person.id == $rootScope.user.id });
                                if (role_obj) {
                                  var role = role_obj.role;
                                } else {
                                  return data;
                                }

                                var status = row.Status;

                                if (role == "PI") {
                                  if (status == "Pending") {
                                    return data;
                                  } else if (status == "Pre-Approval") {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  } else {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  }
                                } else if (role == "PB") {
                                  if (status == "Pending") {
                                    return "<a href=\"#project/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  } else {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  }
                                } else if (role == "PV") {
                                  if (status == "Approved") {
                                    return "<a href=\"#projectreview/"+ row.ProjectID + "/projectid\">" + data + "</a>";
                                  } else {
                                    return data;
                                  }
                                }
                                return data;
                            },
                            "aTargets": [ 1 ]
                        },
                        
                        {
                            //format currency for TotProjImplCost and TotAnnGuarSavings
                            "mRender": function ( data, type, row ) {
				if (data == "0") {
				    return "";
				} else {
				    // hack to insert thousands separators
				    var col = Math.round(data).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                                    col = "$" + col;
                                    return col;
				}
                            },
                            "aTargets": [ 8, 9 ]
                        },
                        {
                            //color codes the % complete; 100% - green; red otherwise
                            "mRender": function ( data, type, row ) {
                                if (data === "100") {
                                    var col = "<span class=\"text-success\">" + data + "%</span> " ;

                                    if (row.Status === "Draft") {
                                        col = col + "<BR><a href=\"#\">Ready to Submit</a>";
                                    }
                                    return col;
                                } else {
                                    return "<span class=\"text-danger\">" + data + "%</span>";
                                } 
                            },
                            "aTargets": [ 12 ]
                        },
                        /*{
                            //checkbox for accreditation status
                            "mRender": function ( data, type, row ) {
                                if (data === "TRUE") {
                                    return "<input type=\"checkbox\" checked>";
                                } else {
                                    return "<input type=\"checkbox\">";
                                }
                            },
                            "aTargets": [ 10 ]
                        },*/
                        {
                            //trashcan to delete
                            "mRender": function ( data, type, row ) {

                                var project = _.find(scope.projects.project, function(proj){ return proj.ProjectID == row.ProjectID; });
                                var role_obj = _.find(project.user_roles, function(person) { return person.id == $rootScope.user.id });
                                if (role_obj) {
                                  var role = role_obj.role;
                                } 
                                var status = row.Status;
                              
                                var pname = "'" + row.ProjName.replace(/[^a-zA-Z0-9]/g,'_') + "'"


                                cell = "<div class=\"dropdown\">" +
                                       "<a data-toggle=\"dropdown\"><span class=\"glyphicon glyphicon-cog\" style=\"font-size: 13px;\"></a>" +
                                       "<ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dLabel\">";
                                //add upload if ESCO or admin && status is 'pending'
                                if ((($rootScope.user.usertype == "Admin")  || (role == "PB")) && (status == "Pending")) {

					                         cell += "<li><a data-ng-click=\"upload(" + row.ProjectID + ")\">Upload from Template</a></li>";
                                }
                                cell +=
                                       "<li><a href=\"/epb/api/schedule/" + row.ProjectID +"\" target=\"_blank\">Download Schedule</a></li>" + 
                                       "<li><a data-ng-click=\"manageparticipants(" + row.ProjectID + ")\">Manage Project Viewers</a></li>";

                                //add the "Unlock" option where it makes sense
                                if ((status == "Pre-Approval") && (role) && (role == "PI")) {
                                  cell += "<li><a data-ng-click=\"unlock(" + row.ProjectID + ")\">Unlock Project</a></li>";
                                }
                                if (((status == "Pre-Approval") || (status == "Approved")) && ($rootScope.user.usertype == "Admin")) {
                                  cell += "<li><a data-ng-click=\"unlock(" + row.ProjectID + ")\">Unlock Project</a></li>";
                                }

                                 cell +=  "<li><a data-ng-click=\"delete(" + row.ProjectID + "," + pname + ")\">Delete</a></li>" +
                                       "</ul></div>";
                                
                    		        return cell;
                            },
                            "aTargets": [ 13 ]
                        }
                    ],
		    "fnCreatedRow": function( nRow, aData, iDataIndex ){

                       $compile(nRow)(scope);
            	    },  
                };
            


            // apply the plugin
            var dataTable = element.dataTable(options);
            scope.initialized=false;
            
            // watch for any changes to our data, rebuild the DataTable
            scope.$watch('projects.project', function(value) {
                var val = value || null;
                //if ((val!=null) && (val.length > 0) && (!scope.initialized)) {
                  if ((val!=null) && (val.length > 0) ) {
                    dataTable.fnClearTable();
                  
                    dataTable.fnAddData(scope.$eval(attrs.aaData)); 
		    //$compile(element)(scope);
                    scope.initialized = true;
                }
            }, true);
        };
    });

//directive for reset password - password matching
epbDirectives.directive('pwmatch', function() {
    
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, elem, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // watch own value and re-validate on change
      scope.$watch(attrs.ngModel, function() {
        validate();
      });

      // observe the other value and re-validate on change
      attrs.$observe('pwmatch', function (val) {
        validate();
      });

      var validate = function() {
        // values
        var val1 = ngModel.$viewValue;
        var val2 = attrs.pwmatch;

        // set validity
        if(val1 && val2)
        if(val1 === val2)
        {
          ngModel.$setValidity('pwmatch', true);
          scope.msghide=true;
        }
        else
        {
          ngModel.$setValidity('pwmatch', false);
          scope.msghide=false;
          scope.mfailed=true;
          scope.msg="Password doesn't match!";
        }  
      };

    }
  }


});






