(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('OrderMgmtController', controller);
	
	controller.$inject = [
		'$q', '$scope', '$modalInstance', '$http', '$rootScope',
		'customerMgmt', 'clientConfig', 'args', 'entityMgmt',
		'championshipMgmt', 'poolMgmt'
	];

	function controller(
		$q, $scope, $modalInstance, $http, $rootScope,
		customerMgmt, clientConfig, args, entityMgmt,
		championshipMgmt, poolMgmt
	) {

		$scope.championshipId = args.championshipId;
		$scope.poolId = args.poolId;
		$scope.entityId = args.entityId;
		if(args.quantity && args.quantity < 6 && args.quantity > 0) {
			$scope.quantity = args.quantity;
		}
		$scope.total = args.total;

		var getEntityPromise = entityMgmt.getEntity($scope.entityId);
		getEntityPromise.then(function(entity) {
			var thisEntity = entity;
			$scope.entity = thisEntity;
		});

		$scope.currentlyAvailableReason = 'na';
		
		$scope.orderCompleted = false;

		$scope.addThisReservation = function(thisEntity) {
			var getSessionPromise = customerMgmt.getSession();
			getSessionPromise.then(function(sessionData) {
				var getChampionshipPromise = championshipMgmt.getChampionship($scope.championshipId);
				getChampionshipPromise.then(function(championship) {
					championship.pools.forEach(function(pool) {
						if(pool.id === $scope.poolId) {
							pool.entities.forEach(function(entity) {
								if(entity.entityId === $scope.entityId) {
									var existingCustomer = false;
									entity.customers.forEach(function(customer) {
										if(customer.customerId === sessionData.customerId) {
											existingCustomer = true;
											if(existingCustomer) {
												var eachCost = ($scope.total / $scope.quantity).toFixed();
												customer.reservations.push({cost: eachCost, quantity: $scope.quantity, total: $scope.total});
												console.log('pool:');
												console.log(pool);
												poolMgmt.updatePool(pool);
//												$rootScope.$broadcast('orderChanged');
												$modalInstance.dismiss('done');
											}
										}
									});
								}
							});
						}
					});
				});
			});
		}
	}

}());
