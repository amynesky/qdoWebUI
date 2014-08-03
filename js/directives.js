//directives are markers on a DOM element that tell AngularJS's HTML compiler to attach a 
//specified behavior to that DOM element or even transform the DOM element and its children

var qdoDirectives = angular.module('qdoDirectives', []);


//the directive for creating a jquery datatable
qdoDirectives.directive('projectTable', function($compile, $rootScope) {
        return function(scope, element, attrs) {

            var options = {
              /*
                    "sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
                    "sPaginationType": "bootstrap",
                    "bPaginate": true,
                    "bLengthChange": false,
                    "bFilter": true,
                    "bSort": true,
		                "bRetrieve": true,
                    "bAutoWidth": false,
                    "aaSorting": [[ 1, "desc" ]],
                    */
                    "sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<ip>>",
                    "sPaginationType": "bootstrap",
                    "aaSorting": [[ 1, "desc" ]], /*default sort rows by second column in descending order*/
                    "bPaginate": true,
                    "bDeferRender": false, 
                    /* false, so that it renders the entire table on load vs only 
                       the visible table elements; this is needed to retrieve 
                        all filtered items, not just the visible filtered items */
                    //"sScrollY": "340px",
                    //"sScrollX": "100%",
                    //"sScrollXInner": "275%",
                    //"bScrollCollapse": true,
                    "bFilter": true,
                    "bSort": true,
                    "bAutoWidth": false,
                    "bSortClasses": false,
                    "bProcessing": false,
                    "bInfo": true, /*Showing 1 to 2,194 of 2,194 entries*/
                    "bLengthChange": true, /*records per page drop down*/
                    "aLengthMenu": [[ 10, 50, 100, -1], [ 10, 50, 100, "All"]], /*records per page drop down*/
                    "aoColumns": [
                        { "mData": "id", "sWidth": "45px"},
                        { "mData": "state", "sWidth": "45px"},      
                        { "mData": "task" , "sWidth": "45px"},
                        { "mData": "err" , "sWidth": "45px"} 
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








