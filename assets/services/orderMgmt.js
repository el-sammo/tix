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
			reserve: function(poolId, entityId, quantity, total, entityName, eOds, eeCount) {
				$modal.open({
					templateUrl: '/templates/addReservation.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								poolId: poolId,
								entityId: entityId,
								quantity: quantity,
								total: total,
								entityName: entityName,
								eOds: eOds,
								eeCount: eeCount
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
