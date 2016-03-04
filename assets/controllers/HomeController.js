(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Home
	///
	app.controller('HomeController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'signupPrompter', 'customerMgmt', 'championshipMgmt',
		'poolMgmt', 'reservationMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		signupPrompter, customerMgmt, championshipMgmt,
		poolMgmt, reservationMgmt
	) {

		signupPrompter.prompt();

		var getSessionPromise = customerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {

			var getChampionshipsPromise = championshipMgmt.getCurrentChampionships();
			getChampionshipsPromise.then(function(championshipData) {
				var completeData = [];
				championshipData.forEach(function(championship) {
					var championshipHotReservationsData = {
						id: championship.id,
						name: championship.name,
						activity: championship.activity,
						tagline: championship.tagline,
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
								hotReservations: [],
							};
							var getHotReservationsPromise = reservationMgmt.getHotReservations(pool.id);
							getHotReservationsPromise.then(function(hotReservationsData) {
								if(typeof hotReservationsData !== 'undefined') {
									hotReservationsData.forEach(function(hotReservation) {
										var thisHotReservation = {
											id: hotReservation[0].id,
											name: hotReservation[0].name,
											mascot: hotReservation[0].mascot,
											leagueCode: hotReservation[0].leagueCode,
											color1: hotReservation[0].color1,
											color2: hotReservation[0].color2,
										};
										if(hotReservation[0].color3) {
											thisHotReservation.color3 = hotReservation[0].color3;
										}
										poolHotReservationData.hotReservations.push(thisHotReservation);
									});
								}
							});
						championshipHotReservationsData.pools.push(poolHotReservationData);
						})
					});
					completeData.push(championshipHotReservationsData);
					$scope.championshipData = completeData;
				});
			});

			if(!sessionData.customerId) {
				signupPrompter.prompt();
			} else {
				$rootScope.customerId = sessionData.customerId;
				$scope.customerId = $rootScope.customerId;
			}
		}).catch(function(err) {
			console.log('customerMgmt.getSession() failed');
			console.log(err);
		});

	}

}());
