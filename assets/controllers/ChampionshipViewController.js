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
		'poolMgmt', 'entityMgmt', 'orderMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt, entityMgmt, orderMgmt
	) {

		$scope.reserve = orderMgmt.reserve;

		var juice = .8;
		var ticketCost = 1500;
		var ticketFactor = .96;

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
							pool.total = 0;
							if(pool.entities) {
								pool.entities.forEach(function(entity) {
									entity.total = 0;
									entity.reservations = 0;
									eds.forEach(function(ed) {
										if(ed.name === entity.entityName) {
											entity.color1 = ed.color1;
											entity.color2 = ed.color2;
											if(ed.color3) {
												entity.color3 = ed.color3;
											} else {
												entity.color3 = '000000';
											}
										}
									});
									if(entity.customers) {
										entity.customers.forEach(function(customer) {
											if(customer.reservations) {
												customer.reservations.forEach(function(reservation) {
													if(reservation.total) {
														entity.total += reservation.total;
														entity.reservations += reservation.quantity;
														pool.total += reservation.total;
														entity.quadRemain = (pool.total * juice) - ((entity.reservations + 4) * ticketCost);
														if(entity.quadRemain > 0) {
															entity.quadCost = (entity.total / entity.reservations).toFixed(2);
															entity.doubleCost = (entity.quadCost / 2 * ticketFactor).toFixed(2);
															entity.singleCost = (entity.doubleCost / 2 * ticketFactor * ticketFactor).toFixed(2);
														} else {
															entity.quadCost = (entity.total / entity.reservations * 5).toFixed(2);
															entity.doubleCost = (entity.quadCost / 2 * ticketFactor).toFixed(2);
															entity.singleCost = (entity.doubleCost / 2 * ticketFactor * ticketFactor).toFixed(2);
														}
													}
												});
											}
										});
									}
								});
							}
						});
	
						championshipData.pools = poolData;
						$scope.championship = championshipData;

						console.log('$scope.championship:');
						console.log($scope.championship);
					});
	
				});
				
			}).catch(function(err) {
				console.log('customerMgmt.getSession() failed');
				console.log(err);
			});

		});
	}

}());
