(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Account
	///

	app.controller('AccountController', controller);
	
	controller.$inject = [
		'$scope', '$http', 'messenger', '$rootScope',
		'$window', 'payMethodMgmt', 'layoutMgmt', 'customerMgmt',
		'accountMgmt', 'reservationMgmt'
	];

	function controller(
		$scope, $http, messenger, $rootScope,
		$window, payMethodMgmt, layoutMgmt, customerMgmt,
		accountMgmt, reservationMgmt
	) {

		$scope.addPM = payMethodMgmt.modals.add;
		$scope.removePM = payMethodMgmt.modals.remove;
		$scope.changeAddress = accountMgmt.modals.changeAddress;

		$scope.logOut = layoutMgmt.logOut;

		var sessionPromise = customerMgmt.getSession();
		sessionPromise.then(function(sessionData) {
			if(!sessionData.customerId) {
				$window.location.href = '/';
				return;
			}

			var customerId = sessionData.customerId;
			customerMgmt.getCustomer(customerId).then(function(customer) {
				$scope.customer = customer;
				var taxExempt = '';
				if(customer.taxExempt) {
					var taxExempt = 'Tax Exempt';
				}
				$scope.taxExempt = taxExempt;

				var getCustomerReservationsPromise = reservationMgmt.getReservationsByCustomerId(customer.id);
				getCustomerReservationsPromise.then(function(reservationData) {

					var completedHistory = [];
					reservationData.forEach(function(reservation) {
						if(reservation.createdAt) {
							reservation.reservationDate = reservation.createdAt.substr(0,10);
						}
						reservation.total = parseFloat(reservation.total).toFixed(2);
						completedHistory.push(reservation);
					});
					$scope.reservations = completedHistory;
				});
			});
		});

		$rootScope.$on('customerChanged', function(evt, customer) {
			$scope.customer = customer;
		});
	}
}());
