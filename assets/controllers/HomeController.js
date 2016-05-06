(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Home
	///
	app.controller('HomeController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', '$window', 
		'signupPrompter', 'customerMgmt', 'championshipMgmt',
		'poolMgmt', 'reservationMgmt', 'entityMgmt', 'orderMgmt',
		'deviceMgr'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, $window,
		signupPrompter, customerMgmt, championshipMgmt,
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

		var firstDataSet = true;

		var getSessionPromise = customerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {

			if(sessionData.customerId) {
				$rootScope.customerId = sessionData.customerId;
				$scope.customerId = $rootScope.customerId;
			}

			var getChampionshipsPromise = championshipMgmt.getCurrentChampionships();
			getChampionshipsPromise.then(function(championshipData) {
				var completeData = [];
				championshipData.forEach(function(championship) {
					var championshipHotReservationsData = {
						id: championship.id,
						name: championship.name,
						activity: championship.activity,
						tagline: championship.tagline,
						league: championship.league,
						date: championship.date,
						location: championship.location,
						pools: [],
					};
					var getPoolsPromise = poolMgmt.getPools(championship.id);
					getPoolsPromise.then(function(poolsData) {
						poolsData.forEach(function(pool) {
							var poolHotReservationData = {
								id:  pool.id,
								name: pool.name,
								eligibleEntities: pool.eligibleEntities,
								hotReservations: [],
							};
							var getHotReservationsPromise = reservationMgmt.getHotReservations(pool.id);
							getHotReservationsPromise.then(function(hotReservationsData) {
								if(typeof hotReservationsData !== 'undefined') {
									hotReservationsData.forEach(function(hotReservation) {

										var expectedOdds = 0;
										poolHotReservationData.eligibleEntities.forEach(function(eligibleEntity) {
											if(eligibleEntity.entityId === hotReservation[0].id) {
												expectedOdds = eligibleEntity.expectedOdds;
											}
										});

										var eeCount = poolHotReservationData.eligibleEntities.length;
										var getCostByPEPromise = reservationMgmt.getCostByPE(
											poolHotReservationData.id +'-p&e-'+ 
											hotReservation[0].id +'-p&e-'+ 
											expectedOdds +'-p&e-'+ 
											eeCount
										);
										getCostByPEPromise.then(function(peData) {
											var thisHotReservation = {
												id: hotReservation[0].id,
												name: hotReservation[0].name,
												mascot: hotReservation[0].mascot,
												leagueCode: hotReservation[0].leagueCode,
												color1: hotReservation[0].color1,
												color2: hotReservation[0].color2,
												cost: peData.nextCost.toFixed(2),
												eOds: expectedOdds,
												eeCount: eeCount
											};
											if(hotReservation[0].color3) {
												thisHotReservation.color3 = hotReservation[0].color3;
											}
											
											poolHotReservationData.hotReservations.push(thisHotReservation);

											// reorder the "hot" reservations
											function compare(a,b) {
												if(parseFloat(a.cost) < parseFloat(b.cost)) {
													return -1;
												} else if(parseFloat(a.cost) > parseFloat(b.cost)) {
													return 1;
												} else { 
													return 0;
												}
											}
											poolHotReservationData.hotReservations.sort(compare);
											if(! deviceMgr.isBigScreen()) {
												poolHotReservationData.hotReservations = poolHotReservationData.hotReservations.slice(0,4);
											}
										});
									});
								}
							});
						championshipHotReservationsData.pools.push(poolHotReservationData);
						})
					});

					if(firstDataSet) {
						championshipHotReservationsData.sportTab = 'sportTabLeft';
						firstDataSet = false;
					} else {
						championshipHotReservationsData.sportTab = 'sportTabRight';
					}

					completeData.push(championshipHotReservationsData);

					$scope.championshipData = completeData;
					$scope.tabShow = completeData[0].id;
				});
			});

		}).catch(function(err) {
			console.log('customerMgmt.getSession() failed');
			console.log(err);
		});

		$scope.showTab = function(id) {
			$scope.tabShow = id;
		}

	}

}());
