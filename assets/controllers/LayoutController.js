(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Layout Controller
	///


	app.controller('LayoutController', controller);
	
	controller.$inject = [
		'navMgr', 'pod', '$scope', '$window',
		'$http', '$routeParams', '$modal', 'layoutMgmt',
		'$rootScope', 'customerMgmt', 'championshipMgmt',
		'signupPrompter', 'deviceMgr'
	];

	function controller(
		navMgr, pod, $scope, $window,
		$http, $routeParams, $modal, layoutMgmt,
		$rootScope, customerMgmt, championshipMgmt,
		signupPrompter, deviceMgr
	) {

		if(deviceMgr.isBigScreen()) {
			$scope.bigScreen = true;
		} else {
			$scope.bigScreen = false;
		}

		$scope.showMenu = false;

		$scope.menuClicked = function(forceValue) {
			if(! _.isUndefined(forceValue)) {
				$scope.showMenu = forceValue;
				return;
			}
			$scope.showMenu = !$scope.showMenu;
		}

		$scope.showLogout = false;
		$scope.accessAccount = false;

		$scope.about = function() {
			$window.location.href = location.origin + "/app/about";
		}

		$scope.contact = function() {
			$window.location.href = location.origin + "/app/contact";
		}

		$scope.faq = function() {
			$window.location.href = location.origin + "/app/faq";
		}

		$scope.home = function() {
			$window.location.href = location.origin + "/app/";
		}

		$scope.story = function() {
			$window.location.href = location.origin + "/app/story";
		}

		$scope.tos = function() {
			$window.location.href = location.origin + "/app/tos";
		}

		$scope.welcome = function() {
			signupPrompter.welcome();
		}

		var bgImgs = [
			'baseball_wide',
			'basketball_wide',
			'football_wide',
			'hockey_wide',
			'racing_wide',
			'soccer_wide'
		];

		var randImg = bgImgs[Math.floor(Math.random() * bgImgs.length)];

		$scope.bgImg = randImg;

		var sessionPromise = customerMgmt.getSession();
		sessionPromise.then(function(sessionData) {
			if(sessionData.customerId) {
				$scope.showLogout = true;
				$scope.accessAccount = true;
				$scope.customerId = sessionData.customerId;
			}

			$scope.showAccount = function() {
				$window.location.href = location.origin + "/app/account";
			}

			$scope.showChampionship = function(id) {
				$window.location.href = location.origin + "/app/championship/" +id;
			}

			$scope.logIn = layoutMgmt.logIn;
			$scope.logOut = layoutMgmt.logOut;
			$scope.signUp = layoutMgmt.signUp;
			$scope.feedback = layoutMgmt.feedback;

			var currentChampionshipsPromise = championshipMgmt.getCurrentChampionships();
			currentChampionshipsPromise.then(function(championshipsData) {
				var leagues = [];
				championshipsData.forEach(function(championship) {
					leagues.push({
						id: championship.id,
						league: championship.league
					});
				});
				$scope.leagues = leagues;
			});
		});

		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		$rootScope.$on('customerLoggedIn', function(evt, args) {
			$scope.showLogout = true;
			$scope.accessAccount = true;
			$scope.customerId = args;
			$rootScope.$broadcast('orderChanged');
		});

	}

}());
