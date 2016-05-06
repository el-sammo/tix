(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Faq
	///
	app.controller('FaqController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope
	) {

		$scope.showWhat = 'resRef';

		$scope.setShow = function(id) {
			$scope.showWhat = id;
		}

	}

}());
