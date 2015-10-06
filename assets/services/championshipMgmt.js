(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Championship Management
	///

	app.factory('championshipMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var getChampionshipPromise;
		var getChampionshipsPromise;

		var service = {
			getChampionship: function(championshipId) {
				if(getChampionshipPromise) {
					return getChampionshipPromise;
				}

				var url = '/championships/' + championshipId;
				getChampionshipPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getChampionshipPromise;
			},

			updateChampionship: function(championship) {
				var url = '/championships/' + championship.id;
				return $http.put(url, championship).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						return championship;
					}
				).catch(function(err) {
					console.log('failure');
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			getCurrentChampionships: function() {
				if(getChampionshipsPromise) {
					return getChampionshipsPromise;
				}

				var url = '/championships/current';
				getChampionshipsPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getChampionshipsPromise;
			}

		};

		return service;
	}

}());
