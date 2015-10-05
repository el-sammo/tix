(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Entity Management
	///

	app.factory('entityMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var getEntityPromise;
		var getEntitiesPromise;

		var service = {
			getEntity: function(entityId) {
				if(getEntityPromise) {
					return getEntityPromise;
				}

				var url = '/entities/' + entityId;
				getEntityPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getEntityPromise;
			},

			getEntities: function() {
				if(getEntitiesPromise) {
					return getEntitiesPromise;
				}

				var url = '/entities/';
				getEntitiesPromise = $http.get(url).then(function(res) {
					return res.data;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getEntitiesPromise;
			}

		};

		return service;
	}

}());
