(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('OrderMgmtController', controller);
	
	controller.$inject = [
		'$q', '$scope', '$modalInstance', '$http', '$rootScope', '$timeout',
		'$window', 'customerMgmt', 'clientConfig', 'args', 'entityMgmt',
		'reservationMgmt', 'signupPrompter', 'layoutMgmt',
		'payMethodMgmt', 'orderMgmt'
	];

	function controller(
		$q, $scope, $modalInstance, $http, $rootScope, $timeout,
		$window, customerMgmt, clientConfig, args, entityMgmt,
		reservationMgmt, signupPrompter, layoutMgmt,
		payMethodMgmt, orderMgmt
	) {

		$scope.showProcessing = false;
		$scope.preventClick = false;
		$scope.getMore = false;

		var getSessionPromise = customerMgmt.getSession();
		getSessionPromise.then(function(sessionData) {

			if(sessionData.customerId) {
				var getCustomerPromise = customerMgmt.getCustomer(sessionData.customerId);
				getCustomerPromise.then(function(customer) {
					var foundCustomer = angular.copy(customer);
					$scope.customer = foundCustomer;
					if(customer.fName && customer.lName && customer.phone) {
						var paymentMethods = foundCustomer.paymentMethods || [];
				
						paymentMethods.forEach(function(payMethod) {
							payMethod.lastFour = redactCC(payMethod.lastFour);
						});
				
						paymentMethods.push({id: 'newCard', lastFour: 'New Credit Card'});
				
						$scope.checkoutPaymentMethods = paymentMethods;
			
					} else {
						$scope.getMore = true;
					}
				});
			} else {
				$modalInstance.dismiss('done');
				layoutMgmt.logIn();
			}
		});

		if(args.poolId) {
			$scope.poolId = args.poolId;
		}

		if(args.entityId) {
			$scope.entityId = args.entityId;
		}

		if(args.quantity) {
			$scope.quantity = args.quantity;
		}

		if(args.total) {
			$scope.total = args.total;
		}

		if(args.entityName) {
			$scope.entityName = args.entityName;
		}

		if(args.eOds) {
			$scope.eOds = args.eOds;
		}

		if(args.eeCount) {
			$scope.eeCount = args.eeCount;
		}

		$scope.showTerms = function() {
console.log('$scope.showTerms() called');			
		}

		$scope.payMethod = {};

		function redactCC(lastFour) {
			return 'XXXX-XXXX-XXXX-' + lastFour;
		}

		$scope.addPM = function() {
			var paymentData = {
				cardNumber: $scope.payMethod.cardNumber.toString(),
				expirationDate: $scope.payMethod.year + '-' + $scope.payMethod.month,
				cvv2: $scope.payMethod.cvv2
			};

			payMethodMgmt.addPM(paymentData).then(function(customer) {
				var payMethod = _.last(customer.paymentMethods);
				var pos = $scope.checkoutPaymentMethods.length - 2;
				$scope.checkoutPaymentMethods.splice(pos, 0, {
					id: payMethod.id,
					lastFour: redactCC(payMethod.lastFour)
				});
				$scope.selMethod = payMethod.id;
			}).catch(function(err) {
				if(err.duplicateCustomerProfile && err.duplicateCustomerProfileId > 0) {
					$scope.customer.aNetProfileId = err.duplicateCustomerProfileId;
					customerMgmt.updateCustomer($scope.customer).then($scope.addPM);
				}
				if(err.duplicatePaymentProfile) {
					if($($window).width() > bigScreenWidth) {
						console.log('showBig');
						$window.location.href = '/app/';
					} else {
						console.log('showSmall');
						$window.location.href = '/app/cart/';
					}
				}
			});
		};

		if($scope.lastLookupId && $scope.entityId === $scope.lastLookupId) {
		} else {
			var getEntityPromise = entityMgmt.getEntity($scope.entityId);
			getEntityPromise.then(function(entity) {
				$scope.entity = entity;
				$scope.lastLookupId = args.entityId;
			});
		}

		$scope.currentlyAvailableReason = 'na';
		
		$scope.orderCompleted = false;

		$scope.addBasics = function() {
			var updateCustomerPromise = customerMgmt.updateCustomer($scope.customer);
			updateCustomerPromise.then(function(response) {
				$modalInstance.dismiss('done');
				$scope.getMore = false;
				orderMgmt.reserve(
					$scope.poolId,
					$scope.entityId,
					$scope.quantity,
					$scope.total,
					$scope.entityName,
					$scope.eOds,
					$scope.eeCount
				);
			});
		}

		$scope.addThisReservation = function() {
			var cost = ($scope.total / $scope.quantity).toFixed(2);

			var reservation = {
				poolId: $scope.poolId, 
				entityId: $scope.entityId,
				eOds: $scope.eOds,
				eeCount: $scope.eeCount,
				entityName: $scope.entityName, 
				customerId: $scope.customer.id,
				aNetProfileId: $scope.customer.aNetProfileId,
				paymentMethodId: $scope.selMethod,
				cost: parseFloat(cost), 
				quantity: parseInt($scope.quantity), 
				total: parseFloat($scope.total)
			};

			var createReservationPromise = reservationMgmt.createReservation(reservation);
			createReservationPromise.then(function(response) {
console.log(' ');				
console.log('response:');				
console.log(response);				
console.log(' ');				
				$scope.showProcessing = true;
				$scope.preventClick = true;
				// this is a hack - we can do better
				$timeout(function() {
					if(response.statusText === 'OK') {
						$window.location.href = location.origin + "/app/account";
						console.log('reservation successful - '+response.data);
						$modalInstance.dismiss('done');
					} else {
						console.log('reservation NOT successful - '+response.data);
					}
				}, 10000)

			});
		}

		$scope.closeReservation = function() {
			$modalInstance.dismiss('done');
		}
	}

}());
