(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('OrderMgmtController', controller);
	
	controller.$inject = [
		'$q', '$scope', '$modalInstance', '$http', '$rootScope',
		'customerMgmt', 'clientConfig', 'args', 'entityMgmt',
		'reservationMgmt'
	];

	function controller(
		$q, $scope, $modalInstance, $http, $rootScope,
		customerMgmt, clientConfig, args, entityMgmt,
		reservationMgmt
	) {

		$scope.poolId = args.poolId;
		$scope.entityId = args.entityId;
		$scope.quantity = args.quantity;
		$scope.total = args.total;
		$scope.entityName = args.entityName;

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
				var eachCost = ($scope.total / $scope.quantity).toFixed();
				var reservation = {
					poolId: $scope.poolId, 
					entityId: $scope.entityId, 
					entityName: $scope.entityName, 
					customerId: sessionData.customerId, 
					cost: eachCost, 
					quantity: $scope.quantity, 
					total: $scope.total
				};
				reservationMgmt.createReservation(reservation);
				$modalInstance.dismiss('done');
			});
		}
	}

}());
