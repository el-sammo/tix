(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: ChampionshipView
	///
	app.controller('ChampionshipViewController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', '$timeout',
		'$window', 'signupPrompter', 'customerMgmt', 'championshipMgmt',
		'poolMgmt', 'reservationMgmt', 'entityMgmt', 'orderMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, $timeout,
		$window, signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt, reservationMgmt, entityMgmt, orderMgmt
	) {

		// listener for customer reserving
		$scope.reserve = orderMgmt.reserve;

		$rootScope.$on('newReservation', function(evt, args) {
			$window.location.reload();
		})

		$scope.poolData = [];

//		function refreshData() {

			var getSessionPromise = customerMgmt.getSession();
			getSessionPromise.then(function(sessionData) {

				var getChampionshipPromise = championshipMgmt.getChampionship($routeParams.id);
				getChampionshipPromise.then(function(championshipData) {

					$scope.championshipData = championshipData;

				});

				var getChampionshipPromise = championshipMgmt.getChampionship($routeParams.id);
				getChampionshipPromise.then(function(championshipData) {

					$scope.championshipData = championshipData;

				});

				var getPoolsPromise = poolMgmt.getPools($routeParams.id);
				getPoolsPromise.then(function(poolData) {

					poolData.forEach(function(pool) {

						var poolId = pool.id;
						var thisPoolData = {};

						thisPoolData.id = pool.id;
						thisPoolData.name = pool.name;
						thisPoolData.entities = [];

						if(pool.eligibleEntities) {
							var eeCount = pool.eligibleEntities.length;
	
							pool.eligibleEntities.forEach(function(entity) {
	
								var getCostByPEPromise = reservationMgmt.getCostByPE(poolId +'-p&e-'+ entity.entityId +'-p&e-'+ entity.expectedOdds +'-p&e-'+ eeCount);
								getCostByPEPromise.then(function(entityData) {
	
									entityData.doubleCost = (entityData.nextCost * 2.02).toFixed(2);
									entityData.quadrupleCost = (entityData.nextCost * 4.04).toFixed(2);
	
									var getEntityColorsPromise = entityMgmt.getColorsByEntityId(entityData.entityId);
									getEntityColorsPromise.then(function(entityColors) {
	
										if(entityColors.color1) {
											entityData.color1= entityColors.color1;
										}
	
										if(entityColors.color2) {
											entityData.color2 = entityColors.color2;
										}
	
										if(entityColors.color3) {
											entityData.color3 = entityColors.color3;
										}
	
										thisPoolData.entities.push(entityData);
	
									});
				
								});
	
							});

							$scope.poolData.push(thisPoolData);

						}

					});

				});

			});
		
//			$timeout(function() {
//				refreshData();
//			}, 30000)
//
//		}
//
//		refreshData();

	}

}());
