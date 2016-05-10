(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Story
	///
	app.controller('StoryController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope
	) {

	}

}());
