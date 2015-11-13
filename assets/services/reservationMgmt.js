(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Reservation Management
	///

	app.factory('reservationMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var getReservationPromise;
		var getReservationsPromise;
		var getReservationsByPoolIdPromise;

		var service = {
			createReservation: function(reservationData) {
				var url = '/reservations/create';
				return $http.post(url, reservationData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						return reservationData;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			getReservation: function(reservationId) {
				if(getReservationPromise) {
					return getReservationPromise;
				}

				var url = '/reservations/' + reservationId;
				getReservationPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getReservationPromise;
			},

			updateReservation: function(reservation) {
				var url = '/reservations/' + reservation.id;
				return $http.put(url, reservation).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						return reservation;
					}
				).catch(function(err) {
					console.log('failure');
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			getReservations: function() {
				if(getReservationsPromise) {
					return getReservationsPromise;
				}

				var url = '/reservations/';
				getReservationsPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getReservationsPromise;
			},

			getReservationsByPoolId: function(poolId) {
//				if(getReservationsByPoolIdPromise) {
//					return getReservationsByPoolIdPromise;
//				}

				var url = '/reservations/byPoolId/' + poolId;
				getReservationsByPoolIdPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getReservationsByPoolIdPromise;
			}

		};

		return service;
	}

}());
