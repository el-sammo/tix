(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: About
	///
	app.controller('AboutController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope
	) {

	}

}());
