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
		'poolMgmt', 'reservationMgmt', 'entityMgmt', 'orderMgmt',
		'deviceMgr'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, $timeout,
		$window, signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt, reservationMgmt, entityMgmt, orderMgmt,
		deviceMgr
	) {

		// listener for customer reserving
		$scope.reserve = orderMgmt.reserve;

		$rootScope.$on('newReservation', function(evt, args) {
			$window.location.reload();
		})

		if(deviceMgr.isBigScreen()) {
			$scope.bigScreen = true;
		} else {
			$scope.bigScreen = false;
		}

		$scope.makeInt = function(num) {
			var numPcs = num.split(".");
			return numPcs[0];
		}

		$scope.showEntity = function(id) {
			$scope.entityShow = id;
			if($scope.tourStep == 5) {
				$scope.tourStep = 6;
			}
		}

		$scope.showPool = function(id) {
			$scope.poolShow = id;
		}

		$scope.poolData = [];

//		function refreshData() {

			var getSessionPromise = customerMgmt.getSession();
			getSessionPromise.then(function(sessionData) {

				var championshipId;

				if($routeParams.id.length > 26) {
					var rpPcs = $routeParams.id.split('-');
					championshipId = rpPcs[0];
					if(rpPcs[1] === 'ts') {
						$scope.tourStep = 5;
					} else {
						$scope.entityShow = rpPcs[1];
						$('#menuDisplay').css('display','initial');
						$('#darkness').css('display','none');
					}
				} else {
					championshipId = $routeParams.id;
					$('#menuDisplay').css('display','initial');
					$('#darkness').css('display','none');
				}

				var getChampionshipPromise = championshipMgmt.getChampionship(championshipId);
				getChampionshipPromise.then(function(championshipData) {

					$scope.championshipData = championshipData;

				});

				var getPoolsPromise = poolMgmt.getPools(championshipId);
				getPoolsPromise.then(function(poolData) {

					poolData.forEach(function(pool) {

						var poolId = pool.id;
						var thisPoolData = {};

						thisPoolData.id = pool.id;
						thisPoolData.name = pool.name;
						thisPoolData.entities = [];

						if(pool.eligibleEntities) {
							var eeCount = pool.eligibleEntities.length;

							pool.eligibleEntities.sort(dynamicSort("entityName"));

							pool.eligibleEntities.forEach(function(entity) {
								var expectedOdds = entity.expectedOdds;
	
								var getCostByPEPromise = reservationMgmt.getCostByPE(poolId +'-p&e-'+ entity.entityId +'-p&e-'+ entity.expectedOdds +'-p&e-'+ eeCount);
								getCostByPEPromise.then(function(entityData) {

									if($scope.entityShow === entityData.entityId) {
										$scope.poolShow = poolId;
									}
	
									entityData.doubleCost = (entityData.nextCost * 2.02).toFixed(2);
									entityData.doubleCostInt = $scope.makeInt(entityData.doubleCost);
									entityData.quadrupleCost = (entityData.nextCost * 4.04).toFixed(2);
									entityData.quadrupleCostInt = $scope.makeInt(entityData.quadrupleCost);
									entityData.nextCost = entityData.nextCost.toFixed(2);
									entityData.nextCostInt = $scope.makeInt(entityData.nextCost);
	
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

										entityData.mascot = entityColors.mascot;

										entityData.eeCount = eeCount;
										entityData.eOds = expectedOdds;
	
										thisPoolData.entities.push(entityData);
	
									});
				
								});
	
							});

							$scope.poolData.push(thisPoolData);
							$scope.poolShow = $scope.poolData[0].id;

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

		function dynamicSort(property) {
			var sortOrder = 1;
			if(property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1);
			}
			return function (a,b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			}
		}

		$scope.tourUp = function() {
			$scope.tourStep ++;
			$scope.checkStep();
		}

		$scope.tourDown = function() {
			$scope.tourStep --;
		}

		$scope.tourEnd = function() {
			$scope.lightness();
		}

		$scope.darkness = true;
		$('#menuDisplay').css('display','none');

		$scope.lightness = function() {
			$scope.darkness = false;
			$('#menuDisplay').css('display','initial');
			$('#darkness').css('display','none');
		}

	}

}());
