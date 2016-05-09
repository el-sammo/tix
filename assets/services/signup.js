(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Signup
	///

	app.factory('signupPrompter', service);
	
	service.$inject = [
		'$rootScope', 'customerMgmt', 'layoutMgmt'
	];
	
	function service(
		$rootScope, customerMgmt, layoutMgmt
	) {
		var hasPrompted = false;
		var service = {
			prompt: function() {
				if(hasPrompted) return;
				hasPrompted = true;

				customerMgmt.getSession().then(function(sessionData) {
					if(sessionData.customerId) {
						$rootScope.$broadcast('customerLoggedIn');
						return;
					}
					layoutMgmt.signUp();
				});
			},

			welcome: function() {
				customerMgmt.getSession().then(function(sessionData) {
					customerMgmt.setWelcomed(sessionData).then(function(welcomeData) {
						layoutMgmt.welcome();
					});
				});
			},

			disclosure: function() {
				layoutMgmt.disclosure();
			}
		};
		return service;
	}


	app.controller('SignUpController', controller);
	
	controller.$inject = [
		'$scope', '$modalInstance', '$http',
		'$rootScope', '$window', 'clientConfig',
		'layoutMgmt', 'customerMgmt'
	];

	function controller(
		$scope, $modalInstance, $http,
		$rootScope, $window, clientConfig,
		layoutMgmt, customerMgmt
	) {

		$scope.haveAccount = function() {
			$modalInstance.dismiss('cancel');
			layoutMgmt.logIn();
		};

		$scope.validEmail = true;
		$scope.validUsername = true;

		$scope.emailSearch = function() {
			if($scope.email === '') return;

			$http.get('/customers/byEmail/' + $scope.email).then(function(res) {
				$scope.validEmail = ! (res.data.length > 0);
			}).catch(function(err) {
				console.log('layoutMgmt: emailSearch ajax failed');
				console.error(err);
			});
		};

		$scope.usernameSearch = function() {
			if($scope.username === '') return;

			$http.get('/customers/byUsername/' + $scope.username).then(function(res) {
				$scope.validUsername = ! (res.data.length > 0);
			}).catch(function(err) {
				console.log('layoutMgmt: usernameSearch ajax failed');
				console.error(err);
			});
		};

		$scope.createAccount = function() {
			var customer = {
				email: $scope.email,
				username: $scope.username,
				password: $scope.password
			}

			customerMgmt.createCustomer(customer).then(function(customerData) {
				var customerData = customerData.data;
				$modalInstance.dismiss('done');
				$scope.submit({
					username: customer.username,
					password: customer.password,
					customerId: customerData.id
				});
console.log('preparing to send email to customer with id: '+customerData.id);				
				$http.post('/mail/sendConfirmationToCustomer/' + customerData.id);
			}).catch(function(err) {
				// if customers ajax fails...
				console.log('LayoutMgmtController: customer-create ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
			});
		};

		$scope.submit = function(credentials) {
			$http.post(
				'/login', credentials
			).success(function(data, status, headers, config) {
				// if login ajax succeeds...
				if(status >= 400) {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				} else if(status == 200) {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				} else {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				}
			}).error(function(err) {
				// if login ajax fails...
				console.log('LayoutMgmtController: logIn ajax failed');
				console.error(err);
				$modalInstance.dismiss('cancel');
			});
		};

	}
}());
