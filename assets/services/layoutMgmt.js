(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Authentication Management
	///

	app.factory('layoutMgmt', service);
	
	service.$inject = [
		'$modal', '$rootScope', '$http'
	];
	
	function service(
		$modal, $rootScope, $http
	) {
		var service = {
			logIn: function() {
				$modal.open({
					templateUrl: '/templates/login.html',
					backdrop: true,
					controller: 'LayoutMgmtController'
				});
			},
			logOut: function() {
				$modal.open({
					templateUrl: '/templates/logout.html',
					backdrop: true,
					controller: 'LayoutMgmtController'
				});
			},
			signUp: function() {
				$modal.open({
					templateUrl: '/templates/signUp.html',
					backdrop: true,
					controller: 'SignUpController'
				});
			},
			welcome: function() {
				$modal.open({
					templateUrl: '/templates/welcome.html',
					backdrop: true,
//					controller: 'WelcomeController'
				});
			},
			disclosure: function() {
				$modal.open({
					templateUrl: '/templates/disclosure.html',
					backdrop: true,
//					controller: 'DisclosureController'
				});
			},
			feedback: function() {
				$modal.open({
					templateUrl: '/templates/feedback.html',
					backdrop: true,
					controller: 'LayoutMgmtController'
				});
			}
		};
		return service;
	}

}());
