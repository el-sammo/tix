(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Customer Management
	///

	app.factory('customerMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var customer;
		var getCustomerPromise;

		var service = {
			getCustomer: function(customerId) {
				if(getCustomerPromise) {
					return getCustomerPromise;
				}

				var url = '/customers/' + customerId;
				getCustomerPromise = $http.get(url).then(function(res) {
					mergeIntoCustomer(res.data);
					return customer;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getCustomerPromise;
			},

			createCustomer: function(customerData) {
				var url = '/customers/create';
				return $http.post(url, customerData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoCustomer(data, true);
						return customer;
					}
				).catch(function(err) {
					console.log('POST ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			updateCustomer: function(customerData) {
				var url = '/customers/' + customerData.id;
				return $http.put(url, customerData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoCustomer(data, true);
						return customer;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			// TODO: This probably can be replaced with client-side only code
			logout: function() {
				var url = '/customers/logout';
				return $http.get(url).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoCustomer({}, true);
						// TODO - Clear session also
					}
				).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			getSession: function() {
				var url = '/customers/session';
				return $http.get(url).then(function(sessionRes) {
					if(! (sessionRes && sessionRes.data)) {
						return $q.reject(sessionRes);
					}
					return sessionRes.data;

				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					$q.reject(err);
				});
			},

			setWelcomed: function(sessionData) {
				sessionData.welcomed = true;
				var url = '/customers/welcomed/' +sessionData.sid;
				return $http.put(url, sessionData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						return data;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			}

			// TODO - Get customer by username
			// :split services/signup.js

		};

		function mergeIntoCustomer(data, replace) {
			if(! customer) {
				customer = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(customer, function(val, key) {
					delete customer[key];
				});
			}

			angular.forEach(data, function(val, key) {
				customer[key] = val;
			});
		};

		return service;
	}

}());
