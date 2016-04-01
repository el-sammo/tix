(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controller: Reservation
	///

	app.config(config);

	config.$inject = [
		'httpInterceptorProvider'
	];

	function config(httpInterceptorProvider) {
		httpInterceptorProvider.register(/^\/reservation/);
	}


	app.controller('ReservationDetailsController', controller);
	
	controller.$inject = [
		'$window', '$scope', '$http', '$routeParams', '$modal', '$timeout',
		'$rootScope', '$q', 'reservationMgmt', 'signupPrompter',
		'querystring', 'configMgr', 'customerMgmt'
	];

	function controller(
		$window, $scope, $http, $routeParams, $modal, $timeout,
		$rootScope, $q, reservationMgmt, signupPrompter,
		querystring, configMgr, customerMgmt
	) {

		// assure that the page is still the same
		// must use pathname on https sites
		if(!location.pathname.match('reservation')) {
			return;
		}
		
		var sessionPromise = customerMgmt.getSession();
		sessionPromise.then(function(sessionData) {

			if(!sessionData.customerId) {
				$window.location.href = '/';
				return;
			}

			var getReservationPromise = reservationMgmt.getReservation($routeParams.id);
			getReservationPromise.then(function(reservation) {

				if(!reservation.customerId === sessionData.customerId) {
					$window.location.href = '/';
					return;
				}

				reservation.date = reservation.createdAt.substr(0,10);

				$scope.reservation = reservation;

				var getCustomerPromise = customerMgmt.getCustomer(reservation.customerId);
				getCustomerPromise.then(function(customer) {
					$scope.customer = customer;
				});
			});
		});
	}
}());
