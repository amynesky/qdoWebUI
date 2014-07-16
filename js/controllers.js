'use strict';

/* Controllers */
var epbControllers = angular.module('qdControllers', []);


/* controller for homepage */
epbControllers.controller('homeCtrl', function ($scope, $rootScope, $location, localStorageService, Auth) {

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
epbControllers.controller('userhomeCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queues) {
       
        $scope.username = $stateParams.username;
        $scope.queues = queues;
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
        $scope.inProgress = function(queue) {return !$scope.succeeded(queue) && !$scope.failed(queue) && $scope.ntasks(queue) > 0;};


        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
          });
        };


        
    });








/* controller for queuepage */
epbControllers.controller('queueCtrl', 
    function ($scope, $rootScope, $stateParams, $location, QueueFactory, localStorageService, queue, queueTaskDetails) {
       
        $scope.username = $stateParams.username;
        $scope.queuename = $stateParams.queuename;
        $scope.queue = queue;
        $scope.queueTaskDetails = queueTaskDetails;

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
        $scope.inProgress = function(queue) {return !$scope.succeeded(queue) && !$scope.failed(queue) && $scope.ntasks(queue) > 0;};

        $scope.logOut = function(){
          $location.path( '/home' );
          $rootScope.$on("$locationChangeSuccess", function(event) { 
            localStorageService.remove("token");
          });
        };

        $scope.goToUserhomePage = function(){$location.path( '/home/' + $scope.username );};

        $scope.pause = function(){QueueFactory.pause($scope.username, $scope.queuename).success(function(data, status, headers, config) {$scope.queue["state"] = "Paused";});};
        $scope.resume = function(){QueueFactory.resume($scope.username, $scope.queuename).success(function(data, status, headers, config) {$scope.queue["state"] = "Active";});};
        $scope.retry = function(){QueueFactory.retry($scope.username, $scope.queuename).success(function(data, status, headers, config) {$scope.queue["state"] = "Active"; });};
        $scope.rerun = function(){QueueFactory.rerun($scope.username, $scope.queuename).success(function(data, status, headers, config) {$scope.queue["state"] = "Active"; });};






        //////////////////////////////////////////////////////////////////
        ///////////////////////DataTables code below//////////////////////
        //////////////////////////////////////////////////////////////////





        /* Set the defaults for DataTables initialisation */
        $.extend( true, $.fn.dataTable.defaults, {
            "sDom": "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": {
            "sLengthMenu": "_MENU_ records per page",
            }
        } );


        /* Default class modification */
        $.extend( $.fn.dataTableExt.oStdClasses, {
            "sWrapper": "dataTables_wrapper form-inline"
        } );

        var filteredNodes;
         
        /* API method to get paging information */
        $.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings ){
            /*this makes the search bar respond to the enter key*/
            $('#queueTaskDetailTable_filter input').unbind('keypress keyup');
            $('#queueTaskDetailTable_filter input').bind('keypress keyup', function(e) {
                if ($(this).val().length < 3 && e.keyCode != 13) {return;}  
                else{
                    oTable.fnFilter($(this).val()); 
                }
                if(e.keyCode == 13) {
                    /* this is a hook to retrieve the nodes that are filters */ 
                    filteredNodes = oTable._('tr', {"filter":"applied"}); /* get all the filtered table rows */
                }
            });
            return {
                "iStart":         oSettings._iDisplayStart,
                "iEnd":           oSettings.fnDisplayEnd(),
                "iLength":        oSettings._iDisplayLength,
                "iTotal":         oSettings.fnRecordsTotal(),
                "iFilteredTotal": oSettings.fnRecordsDisplay(),
                "iPage":          oSettings._iDisplayLength === -1 ?
                    0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
                "iTotalPages":    oSettings._iDisplayLength === -1 ?
                    0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
            };
        }
        /* pagination control */
        $.extend( $.fn.dataTableExt.oPagination, {
            "bootstrap": {
                "fnInit": function( oSettings, nPaging, fnDraw ) {
                    var oLang = oSettings.oLanguage.oPaginate;
                    var fnClickHandler = function ( e ) {
                        e.preventDefault();
                        if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                            fnDraw( oSettings );
                        }
                    };
         
                    $(nPaging).addClass('pagination pagination-right').append(
                        '<ul id="toggleList">' +
                            '<li class="prev disabled pages"><a href="#">&larr; ' + oLang.sFirst + '</a></li>' +
                            '<li class="prev disabled pages"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
                            '<li class="next disabled pages"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' +
                            '<li class="next disabled pages"><a href="#">' + oLang.sLast + ' &rarr; </a></li>' +
                        '</ul>'
                    );
                    var els = $('a', nPaging);
                    $(els[0]).bind('click.DT', { action: "first" }, fnClickHandler);
                    $(els[1]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
                    $(els[2]).bind('click.DT', { action: "next" }, fnClickHandler);
                    $(els[3]).bind('click.DT', { action: "last" }, fnClickHandler);
                },
         
                "fnUpdate": function ( oSettings, fnDraw ) {
                    var iListLength = 5;
                    var oPaging = oSettings.oInstance.fnPagingInfo();
                    var an = oSettings.aanFeatures.p;
                    var i, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);
         
                    if ( oPaging.iTotalPages < iListLength) {
                        iStart = 1;
                        iEnd = oPaging.iTotalPages;
                    }
                    else if ( oPaging.iPage <= iHalf ) {
                        iStart = 1;
                        iEnd = iListLength;
                    } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                        iStart = oPaging.iTotalPages - iListLength + 1;
                        iEnd = oPaging.iTotalPages;
                    } else {
                        iStart = oPaging.iPage - iHalf + 1;
                        iEnd = iStart + iListLength - 1;
                    }
         
                    for ( i=0, iLen=an.length ; i<iLen ; i++ ) {
                        // Remove the middle elements
                        $('li:gt(1)', an[i]).filter(':not(.next)').remove();
         
                        // Add the new list items and their event handlers
                        for ( j=iStart ; j<=iEnd ; j++ ) {
                    sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
                            $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                                .insertBefore( $('li.next:first', an[i])[0] )
                                .bind('click', function (e) {
                                    e.preventDefault();
                                    oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                                    fnDraw( oSettings );
                                } );
                        }
         
                        // Add / remove disabled classes from the static elements
                        if ( oPaging.iPage === 0 ) {
                            $('li.prev', an[i]).addClass('disabled');
                        } else {
                            $('li.prev', an[i]).removeClass('disabled');
                        }
         
                        if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                            $('li.next', an[i]).addClass('disabled');
                        } else {
                            $('li.next', an[i]).removeClass('disabled');
                        }
                    }
                }
            }
        } );

        /*
         * TableTools Bootstrap compatibility
         * Required TableTools 2.1+
         */
        if ( $.fn.DataTable.TableTools ) {
            // Set the classes that TableTools uses to something suitable for Bootstrap
            $.extend( true, $.fn.DataTable.TableTools.classes, {
                "container": "DTTT btn-group",
                "buttons": {
                    "normal": "btn",
                    "disabled": "disabled"
                },
                "collection": {
                    "container": "DTTT_dropdown dropdown-menu",
                    "buttons": {
                        "normal": "",
                        "disabled": "disabled"
                    }
                },
                "print": {
                    "info": "DTTT_print_info modal"
                },
                "select": {
                    "row": "active"
                }
            } );

            // Have the collection use a bootstrap compatible dropdown
            $.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
                "collection": {
                    "container": "ul",
                    "button": "li",
                    "liner": "a"
                }
            } );
        }
        $.fn.dataTableExt.oApi.fnGetTd  = function ( oSettings, iTd ){  
            // Looking at both visible and hidden TD elements - convert to visible index, if not present
            // then it must be hidden. Return as appropriate
            var iCalcVis = oSettings.oApi._fnColumnIndexToVisible( oSettings, iTd );
            return iCalcVis;
        };

        function getVisibleIndexofColumn(index){
            var nTd = oTable.fnGetTd( index );
            return nTd;
        }

        /*clear search bar button*/
        if ( typeof $.fn.dataTable == "function" && typeof $.fn.dataTableExt.fnVersionCheck == "function" && $.fn.dataTableExt.fnVersionCheck('1.9.2')/*older versions should work too*/ )
        {
            $.fn.dataTableExt.oApi.clearSearch = function ( oSettings )
            {
         
                var table = this;
                 
                //any browser, must include your own file
                //var clearSearch = $('<img src="/images/delete.png" style="vertical-align:text-bottom;cursor:pointer;" alt="Delete" title="Delete"/>');
                 
                //no image file needed, css embedding must be supported by browser
                var clearSearch = $('<img title="Delete" alt="" src="data:image/png;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAD2SURBVHjaxFM7DoMwDH2pOESHHgDPcB223gKpAxK34EAMMIe1FCQOgFQxuflARVBSVepQS5Ht2PHn2RHMjF/ohB8p2gSZpprtyxEHX8dGTeMG0A5UlsD5rCSGvF55F4SpqpSm1GmCzPO3LXJy1LXllwvodoMsCpNVy2hbYBjCLRiaZ8u7Dng+QXlu9b4H7ncvBmKbwoYBWR4kaXv3YmAMyoEpjv2PdWUHcP1j1ECqFpyj777YA6Yss9KyuEeDaW0cCsCUJMDjYUE8kr5TNuOzC+JiMI5uz2rmJvNWvidwcJXXx8IAuwb6uMqrY2iVgzbx99/4EmAAarFu0IJle5oAAAAASUVORK5CYII=" style="vertical-align:text-bottom;cursor:pointer;" />');
                $(clearSearch).click( function ()
                        {
                            table.fnFilter('');
                        });
                $(oSettings.nTableWrapper).find('div.dataTables_filter').append(clearSearch);
                $(oSettings.nTableWrapper).find('div.dataTables_filter label').css('margin-right', '-16px');//16px the image width
                $(oSettings.nTableWrapper).find('div.dataTables_filter input').css('padding-right', '16px');
            }
         
            //auto-execute, no code needs to be added
            $.fn.dataTable.models.oSettings['aoInitComplete'].push( {
                "fn": $.fn.dataTableExt.oApi.clearSearch,
                "sName": 'whatever'
            } );
        }

        //Table initialisation 
        var oTable;

        $(document).ready(function() {
                var queryString = window.location.search;
                if (queryString === "") {
                    $.extend( $.fn.dataTable.defaults, {
                        "iDisplayLength": 10,  //default number of rows per page
                    } );
                } else {
                    $.extend( $.fn.dataTable.defaults, {
                        "iDisplayLength": -1,  //default number of rows per page
                    } );
                }
                oTable = $('#queueTaskDetailTable').dataTable( {
                    "sDom": "<'row'<'col-lg-6'f><'col-lg-6'l>r>t<'row'<ip>>",
                    "sPaginationType": "bootstrap",
                    "aaSorting": [[ 1, "desc" ]], //default sort rows by second column in descending order
                    "bPaginate": true,
                    "bLengthChange": true, //records per page drop down
                    "bDeferRender": false, 
                    // false, so that it renders the entire table on load vs only 
                       //the visible table elements; this is needed to retrieve 
                        //all filtered items, not just the visible filtered items 
                    "sScrollY": "340px",
                    "sScrollX": "100%",
                    "sScrollXInner": "275%",
                    "bScrollCollapse": true,
                    "bFilter": true,
                    "bSort": true,
                    "bInfo": true, //Showing 1 to 2,194 of 2,194 entries
                    "bAutoWidth": false,
                    "bSortClasses": false,
                    "bProcessing": true,
                    "ajax": "data/blatfooTaskDetails.json",///////////// I WANT TO POPULATE WITH THE $scope.queueTaskDetails OBJECT BUT FIRST I NEED TO GET THE TABLE TO LOAD AT ALL
                    "aLengthMenu": [[ 50, 100, 500, 1000, -1], [ 50, 100, 500, 1000, "All"]], //records per page drop down
                    "aoColumns": [
                        { "mData": "id"},
                        { "mData": "state"},      
                        { "mData": "task" },  
                           
                    ],

                } );
                

                $(window).resize( function () {
                    oTable.fnAdjustColumnSizing();
                } );

                


});
