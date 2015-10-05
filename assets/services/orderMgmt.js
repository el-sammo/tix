(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Order Management
	///

	app.factory('orderMgmt', service);
	
	service.$inject = [
		'$modal', '$rootScope', '$http'
	];
	
	function service($modal, $rootScope, $http) {
		var service = {
			checkout: function(order) {
				$modal.open({
					templateUrl: '/templates/checkout.html',
					backdrop: true,
					controller: 'CheckoutController',
					resolve: {
						args: function() {
							return {
								order: order
							}
						}
					}
				});
			},
			reserve: function(championshipId, poolId, entityId, quantity, total) {
				$modal.open({
					templateUrl: '/templates/addReservation.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								championshipId: championshipId,
								poolId: poolId,
								entityId: entityId,
								quantity: quantity,
								total: total
							}
						}
					}
				});
			},
			remove: function(thing) {
				$modal.open({
					templateUrl: '/templates/removeItemOptions.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								thing: thing
							}
						}
					}
				});
			}
		};
		return service;
	}

}());
