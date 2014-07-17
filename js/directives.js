var qdoDirectives = angular.module('qdoDirectives', []);



//the directive for creating a jquery datatable
qdoDirectives.directive('projectTable', function($compile, $rootScope) {
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
                        { "mData": "id"},
                        { "mData": "state"},      
                        { "mData": "task" },
                        { "mData": "err" } 
                    ],
          /*makes cells content sensitive*/
          "fnRowCallback": function( nRow, aData, iDisplayIndex,iDisplayIndexFull) {
                $(nRow).children().each(function(index, td) {
                  if(index == 1){ /*State*/
                      if ($(td).html() === "Failed") {
                          $(td).css("color", "#FF3229");
                      };
                  }              
              });                        
              return nRow;
            },
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








