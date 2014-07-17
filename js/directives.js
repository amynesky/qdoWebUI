var qdoDirectives = angular.module('qdoDirectives', []);



//the directive for creating a jquery datatable
qdoDirectives.directive('projectTable', function($compile, $rootScope) {
        return function(scope, element, attrs) {

            var options = {
                    "sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
                    //"sPaginationType": "bootstrap",
                    "bPaginate": true,
                    "bLengthChange": false,
                    "bFilter": true,
                    "bSort": true,
		                "bRetrieve": true,
                    "bAutoWidth": false,
                    "aaSorting": [[ 1, "desc" ]],
                    "aoColumns": [
                        { "mData": "id"},
                        { "mData": "state"},      
                        { "mData": "task" },
                        { "mData": "err" } 
                    ],
                    /*
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
                    ],*/
		    "fnCreatedRow": function( nRow, aData, iDataIndex ){

                       $compile(nRow)(scope);
            	    },  
                };
            


            // apply the plugin
            var dataTable = element.dataTable(options);
            scope.initialized=false;
            
            // watch for any changes to our data, rebuild the DataTable
            scope.$watch('queueTaskDetails', function(value) {
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








