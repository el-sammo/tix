(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: ChampionshipView
	///
	app.controller('ChampionshipViewController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', '$timeout',
		'signupPrompter', 'customerMgmt', 'championshipMgmt',
		'poolMgmt', 'reservationMgmt', 'entityMgmt', 'orderMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, $timeout,
		signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt, reservationMgmt, entityMgmt, orderMgmt
	) {

		// listener for customer reserving
		$scope.reserve = orderMgmt.reserve;

		$rootScope.$on('newReservation', function(evt, args) {
			refreshData();
		})

		$scope.juice = .8;
		$scope.ticketCost = 1500;
		$scope.ticketFactor = .96;

		$scope.poolData = [];

		function refreshData() {

			var getEntitiesPromise = entityMgmt.getEntities();
			getEntitiesPromise.then(function(entityData) {
				var eds = entityData;
	
				var getSessionPromise = customerMgmt.getSession();
				getSessionPromise.then(function(sessionData) {
		
					var getChampionshipPromise = championshipMgmt.getChampionship($routeParams.id);
					getChampionshipPromise.then(function(championshipData) {
			
						var getPoolsPromise = poolMgmt.getPools(championshipData.id);
						getPoolsPromise.then(function(poolData) {
			
							poolData.forEach(function(pool) {
			
								var getPoolReservations = reservationMgmt.getReservationsByPoolId(pool.id);
								getPoolReservations.then(function(poolReservationData) {
			
									var thisPoolData = {};
									thisPoolData.id = pool.id;
									thisPoolData.name = pool.name;
									thisPoolData.total = 0;
									thisPoolData.entities = [];
			
			
									var entity = {};
									entity.reservations = 0;
									entity.total = 0;
									var first = true;
									var lastProcessed = '';
			
									poolReservationData.forEach(function(reservation) {
										if(first) {
											entity.id = reservation.entityId;
											entity.name = reservation.entityName;
											entity.reservations += parseInt(reservation.quantity);
											entity.total += parseFloat(reservation.total);
											thisPoolData.total += parseFloat(reservation.total);
											first = false;
										} else {
											if(lastProcessed === reservation.entityName) {
												entity.reservations += parseInt(reservation.quantity);
												entity.total += parseFloat(reservation.total);
												thisPoolData.total += parseFloat(reservation.total);
											} else {
												eds.forEach(function(ed) {
													if(ed.name === entity.name) {
														entity.color1 = ed.color1;
														entity.color2 = ed.color2;
														if(ed.color3) {
															entity.color3 = ed.color3;
														} else {
															entity.color3 = '000000';
														}
													}
												});

if(entity.name === 'Buffalo') {
	console.log('entity:');
	console.log(entity);
}
			
												thisPoolData.entities.push(entity);
												entity = {};
												entity.reservations = 0;
												entity.total = 0;
												entity.id = reservation.entityId;
												entity.name = reservation.entityName;
												entity.reservations += parseInt(reservation.quantity);
												entity.total += parseFloat(reservation.total);
												thisPoolData.total += parseFloat(reservation.total);
											}
										}
										lastProcessed = reservation.entityName;
									});
			
									thisPoolData.entities.push(entity);

console.log('thisPoolData:');
console.log(thisPoolData);
			
									$scope.poolData.push(thisPoolData);

									$scope.championship = championshipData;
			
								});
			
							});
			
						});
			
					});
	
				});
	
			});
		
			$timeout(function() {
				refreshData();
			}, 30000)

		}

		refreshData();


//		var getEntitiesPromise = entityMgmt.getEntities();
//		getEntitiesPromise.then(function(entityData) {
//			var eds = entityData;
//
//			var getSessionPromise = customerMgmt.getSession();
//			getSessionPromise.then(function(sessionData) {
//	
//				var getChampionshipPromise = championshipMgmt.getChampionship($routeParams.id);
//				getChampionshipPromise.then(function(championshipData) {
//	
//					var getPoolsPromise = poolMgmt.getPools(championshipData.id);
//					getPoolsPromise.then(function(poolData) {
//	
//						var getReservationsPromise = reservationMgmt.getReservations();
//						getReservationsPromise.then(function(reservationData) {
//
//							reservationData.sort(function(a, b) {
//								return a.entityName.localeCompare(b.entityName);
//							});
//
//							var allPoolData = [];
//
//							poolData.forEach(function(pool) {
//
//								var thisPool = {};
//								thisPool.id = pool.id;
//								thisPool.name = pool.name;
//								thisPool.total = 0;
//								thisPool.entities = [];
//
//								var entity = {};
//								entity.reservations = 0;
//								entity.total = 0;
//								var first = true;
//								var lastProcessed = '';
//								reservationData.forEach(function(reservation) {
//									if(reservation.poolId === pool.id) {
//										if(first) {
//											entity.id = reservation.entityId;
//											entity.name = reservation.entityName;
//											entity.reservations += parseInt(reservation.quantity);
//											entity.total += parseFloat(reservation.total);
//											thisPool.total += parseFloat(reservation.total);
//											first = false;
//										} else {
//											if(lastProcessed === reservation.entityName) {
//												entity.reservations += parseInt(reservation.quantity);
//												entity.total += parseFloat(reservation.total);
//												thisPool.total += parseFloat(reservation.total);
//											} else {
//												eds.forEach(function(ed) {
//													if(ed.name === entity.name) {
//														entity.color1 = ed.color1;
//														entity.color2 = ed.color2;
//														if(ed.color3) {
//															entity.color3 = ed.color3;
//														} else {
//															entity.color3 = '000000';
//														}
//													}
//												});
//
//												if(entity.name === 'Buffalo') {
//													console.log('entity:');
//													console.log(entity);
//												}
//
//												thisPool.entities.push(entity);
//												entity = {};
//												entity.reservations = 0;
//												entity.total = 0;
//												entity.id = reservation.entityId;
//												entity.name = reservation.entityName;
//												entity.reservations += parseInt(reservation.quantity);
//												entity.total += parseFloat(reservation.total);
//												thisPool.total += parseFloat(reservation.total);
//											}
//										}
//										lastProcessed = reservation.entityName;
//									}
//								});
//
//								thisPool.entities.push(entity);
//
//								allPoolData.push(thisPool);
//
//								championshipData.pools = allPoolData;
//
//								$scope.championship = championshipData;
//
//							});
//
//						});
//	
//					});
//	
//				});
//				
//			}).catch(function(err) {
//				console.log('customerMgmt.getSession() failed');
//				console.log(err);
//			});
//
//		});

	}

}());
