(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('OrderMgmtController', controller);
	
	controller.$inject = [
		'$q', '$scope', '$modalInstance', '$http', '$rootScope',
		'customerMgmt', 'clientConfig', 'args', 'entityMgmt',
		'reservationMgmt', 'signupPrompter'
	];

	function controller(
		$q, $scope, $modalInstance, $http, $rootScope,
		customerMgmt, clientConfig, args, entityMgmt,
		reservationMgmt, signupPrompter
	) {

		if(args.poolId) {
			$scope.poolId = args.poolId;
		}

		if(args.entityId) {
			$scope.entityId = args.entityId;
		}

		if(args.quantity) {
			$scope.quantity = args.quantity;
		}

		if(args.total) {
			$scope.total = args.total;
		}

		if(args.entityName) {
			$scope.entityName = args.entityName;
		}

		if($scope.lastLookupId && $scope.entityId === $scope.lastLookupId) {
		} else {
			var getEntityPromise = entityMgmt.getEntity($scope.entityId);
			getEntityPromise.then(function(entity) {
				$scope.entity = entity;
				$scope.lastLookupId = args.entityId;
			});
		}

		$scope.currentlyAvailableReason = 'na';
		
		$scope.orderCompleted = false;

		$scope.addThisReservation = function() {

			var cost = ($scope.total / $scope.quantity).toFixed(2);

			var getSessionPromise = customerMgmt.getSession();
			getSessionPromise.then(function(sessionData) {

				if(sessionData.customerId) {
					var reservation = {
						poolId: $scope.poolId, 
						entityId: $scope.entityId, 
						entityName: $scope.entityName, 
						customerId: sessionData.customerId, 
						cost: parseFloat(cost), 
						quantity: parseInt($scope.quantity), 
						total: parseFloat($scope.total)
					};
					
					var createReservationPromise = reservationMgmt.createReservation(reservation);
					createReservationPromise.then(function(response) {
						if(response.statusText === 'OK') {
							$rootScope.$broadcast('newReservation');
							console.log('reservation successful');
						} else {
							console.log('reservation NOT successful');
						}
						$modalInstance.dismiss('done');
					});
				} else {
					$modalInstance.dismiss('done');
					signupPrompter.prompt();
				}

			});
		}

		$scope.closeReservation = function() {
			$modalInstance.dismiss('done');
		}
	}

}());
