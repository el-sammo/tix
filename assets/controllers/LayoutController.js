(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Layout Controller
	///


	app.controller('LayoutController', controller);
	
	controller.$inject = [
		'navMgr', 'pod', '$scope', '$window',
		'$http', '$routeParams', '$modal', 'layoutMgmt',
		'$rootScope', 'hoursMgr', 'customerMgmt'
	];

	function controller(
		navMgr, pod, $scope, $window,
		$http, $routeParams, $modal, layoutMgmt,
		$rootScope, hoursMgr, customerMgmt
	) {

		$scope.showLogout = false;
		$scope.accessAccount = false;

		var sessionPromise = customerMgmt.getSession();
		sessionPromise.then(function(sessionData) {
			if(sessionData.customerId) {
				$scope.showLogout = true;
				$scope.accessAccount = true;
				$scope.customerId = sessionData.customerId;
			}

			$scope.showAccount = function() {
				$window.location.href = location.origin + "/app/account";
			}

			$scope.logIn = layoutMgmt.logIn;
			$scope.logOut = layoutMgmt.logOut;
			$scope.signUp = layoutMgmt.signUp;
			$scope.feedback = layoutMgmt.feedback;
		});

		$rootScope.$on('customerLoggedIn', function(evt, args) {
			$scope.showLogout = true;
			$scope.accessAccount = true;
			$scope.customerId = args;
			$rootScope.$broadcast('orderChanged');
		});

	}

}());
