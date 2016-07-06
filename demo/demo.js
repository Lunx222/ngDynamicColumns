(function() {
    "use strict";

    var app = angular.module("demo", ["ngDynamicColumns"]);

    app.controller("demoCtrl", function demoCtrl($scope, $rootScope, $filter, personService) {
        var dateColumn = {"id": "date", rowDirective: "datecolumn", columnDirective: 'datecolumn-header', visible: true, name: "Date ", scopedAttrs: {'person': 'person', 'persons': 'persons'}},
	        uniqueDates = [],
	        personalKeys = ['id', 'lastName', 'firstName', 'medicalInfo', 'contactNumber'],
	        columns = [
	            {"id": "lastName", rowDirective: "lastname", columnDirective: 'lastname-header', visible: true, "name": "Last Name"},
	            {"id": "firstName", rowDirective: "firstname", columnDirective: 'firstname-header',visible: true, "name": "First Name"},
	            {"id": "contactNumber", rowDirective: "contactnumber", columnDirective: 'contactnumber-header',visible: true, "name": "Contact Number"},
	            {"id": "medicalInfo", rowDirective: "medicalinfo", columnDirective: 'medicalinfo-header',visible: true, "name": "Medical Info"}

	        ];

	    /**
	     * This creates a bunch of test data and columns so that there are not hard-coded, unique attending columns
	     * additionally to the static columns for the static attributes. 
	     * 
	     */
	    function initPersons() {
		    uniqueDates = [];

		    $scope.columns = angular.copy(columns);
		    personService.randomize();
		    $scope.persons = personService.persons;
		    $scope.persons.forEach(function(person) {
			    for (var key in person) {
				    if (person.hasOwnProperty(key) && personalKeys.indexOf(key) === -1 && uniqueDates.indexOf(key) === -1) {
					    uniqueDates.push(key);
				    }
			    }
		    });

		    uniqueDates.sort(function(a, b){return a-b;});

		    uniqueDates.forEach(function (date) {
			    var column = angular.copy(dateColumn);

			    column.id = column.id + date;
			    column.name = $filter('date')(new Date(parseInt(date)), 'dd.MM.yyyy');
			    $scope.columns.push(column);
		    });

		    $rootScope.$emit("recreateColumns");

	    }

        initPersons();

        $scope.columnChanged = function(column) {
            $rootScope.$emit("columnToggled", column.id);
        };

        $scope.moveFirstColumnToLast = function () {
	        var max = $scope.columns.length;
            $rootScope.$emit("columnOrderChanged", $scope.columns[0].id, $scope.columns[max-1].id);
        };

        $scope.shuffleColumns = function() {
            $scope.columns.sort(function() {
                return 0.5 - Math.random();
            });

            $rootScope.$emit("recreateColumns");
        };

	    $scope.randomizePersons = function() {
		    initPersons();
	    };

		$scope.isVisible = function (person) {
			var isVisible = false;
			for (var key in person) {
				if (person.hasOwnProperty(key)) {
					if (personalKeys.indexOf(key) === -1) {
						for (var i = 0; i < $scope.columns.length; i++) {
							var column = $scope.columns[i];
							if (column.id === 'date' + key && column.visible) {
								isVisible = true;
								break;
							}
						}

						if (isVisible) {
							break;
						}
					}
				}
			}

			return isVisible;
		};
    });

	app.directive("lastname", function() {
        return {
            restrict: "A",
            template: "<div><strong>{{ person.lastName }}</strong></div>"
        };
    });

	app.directive("lastnameHeader", function() {
		return {
			restrict: "A",
			template: "<div drop-target on-drop='dropped(source, dest)' draggable-header='lastname'>Last name</div>"
		};
	});

    app.directive("firstname", function() {
        return {
            restrict: "A",
            template: "<div>{{ person.firstName}}</div>"
        };
    });

	app.directive("firstnameHeader", function() {
		return {
			restrict: "A",
			template: "<div drop-target on-drop='dropped(source, dest)' draggable-header='firstname'>First name</div>"
		};
	});

    app.directive("contactnumber", function() {
        return {
            restrict: "A",
            template: "<div>{{ person.contactNumber}}</div>"
        };
    });

	app.directive("contactnumberHeader", function() {
		return {
			restrict: "A",
			template: "<div drop-target on-drop='dropped(source, dest)' draggable-header='contactnumber'>Contact Number</div>"
		};
	});

    app.directive("medicalinfo", function() {
        return {
            restrict: "A",
            template: "<div>{{ person.medicalInfo}}</div>"
        };
    });

	app.directive("medicalinfoHeader", function() {
		return {
			restrict: "A",
			template: "<div drop-target on-drop='dropped(source, dest)' draggable-header='medicalinfo'>Medical Info</div>"
		};
	});

    app.directive("datecolumn", function() {
        return {
            restrict: "A",
	        scope: {
		        person: "="
	        },
            template: "<div ng-show='show'><i class='glyphicon glyphicon-ok'></i> </div>",
	        link: function(scope, element, attrs) {
		        var key = attrs.colId.substr(4, attrs.colId.length),
			        person = scope.person,
			        attending = person[key];

		        scope.date = key;
		        scope.attending = attending;
		        scope.show = key && attending;
	        }
        };
    });

	app.directive("datecolumnHeader", function(personService, $rootScope) {
		//use isolated scope as this column is used more than once and scope variables need to be unique for each instance
		return {
			restrict: "A",
			scope: {
				persons: "="
			},
			template: "<div drop-target on-drop='datecolumnDropped(source, dest)' draggable-header='{{colId}}'>{{date | date: 'dd.MM.yyyy'}} ({{attendingPersons}})</div>",
			link: function(scope, element, attrs) {
				scope.date = attrs.colId.substr(4, attrs.colId.length);
				scope.colId = attrs.colId;
				scope.attendingPersons = personService.getAttendingPersonCountForColumn(scope.persons, attrs.colId);

				scope.datecolumnDropped = function (source, dest) {
					//using angular event for "calling" onDrop method on ColumnHeaderDirective because of isolated scope
					$rootScope.$emit('columnDropped', source, dest);
				};
			}
		};
	});


})();
