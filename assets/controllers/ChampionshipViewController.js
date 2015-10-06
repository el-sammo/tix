(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: ChampionshipView
	///
	app.controller('ChampionshipViewController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'customerMgmt', 'championshipMgmt',
		'poolMgmt', 'reservationMgmt', 'entityMgmt', 'orderMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt, reservationMgmt, entityMgmt, orderMgmt
	) {

		// listener for customer reserving
		$scope.reserve = orderMgmt.reserve;

		$scope.juice = .8;
		$scope.ticketCost = 1500;
		$scope.ticketFactor = .96;

		var getEntitiesPromise = entityMgmt.getEntities();
		getEntitiesPromise.then(function(entityData) {
			var eds = entityData;

			var getSessionPromise = customerMgmt.getSession();
			getSessionPromise.then(function(sessionData) {
	
				var getChampionshipPromise = championshipMgmt.getChampionship($routeParams.id);
				getChampionshipPromise.then(function(championshipData) {
	
					var getPoolsPromise = poolMgmt.getPools(championshipData.id);
					getPoolsPromise.then(function(poolData) {
	
						var getReservationsPromise = reservationMgmt.getReservations();
						getReservationsPromise.then(function(reservationData) {

							reservationData.sort(function(a, b) {
								return a.entityName.localeCompare(b.entityName);
							});

							var allPoolData = [];

							poolData.forEach(function(pool) {

								var thisPool = {};
								thisPool.id = pool.id;
								thisPool.name = pool.name;
								thisPool.total = 0;
								thisPool.entities = [];

								var entity = {};
								entity.reservations = 0;
								entity.total = 0;
								var first = true;
								var lastProcessed = '';
								reservationData.forEach(function(reservation) {
									if(reservation.poolId === pool.id) {
										if(first) {
											entity.id = reservation.entityId;
											entity.name = reservation.entityName;
											entity.reservations += parseInt(reservation.quantity);
											entity.total += parseFloat(reservation.total);
											thisPool.total += parseFloat(reservation.total);
											first = false;
if(reservation.entityName === 'Baltimore') {
	console.log('Baltimore (first):');
	console.log(entity);
}
										} else {
											if(lastProcessed === reservation.entityName) {
												entity.reservations += parseInt(reservation.quantity);
												entity.total += parseFloat(reservation.total);
												thisPool.total += parseFloat(reservation.total);
if(reservation.entityName === 'Baltimore') {
	console.log('Baltimore (subsequent):');
	console.log(entity);
}
											} else {
if(entity.name === 'Baltimore') {
	console.log('Baltimore (final):');
	console.log(entity);
}
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

												thisPool.entities.push(entity);
												entity = {};
												entity.reservations = 0;
												entity.total = 0;
												entity.id = reservation.entityId;
												entity.name = reservation.entityName;
												entity.reservations += parseInt(reservation.quantity);
												entity.total += parseFloat(reservation.total);
												thisPool.total += parseFloat(reservation.total);
											}
										}
										lastProcessed = reservation.entityName;
									}
								});

								thisPool.entities.push(entity);

								allPoolData.push(thisPool);

								championshipData.pools = allPoolData;
								$scope.championship = championshipData;

							});

						});
	
					});
	
				});
				
			}).catch(function(err) {
				console.log('customerMgmt.getSession() failed');
				console.log(err);
			});

		});

	}

}());
