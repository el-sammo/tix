(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Routes
	///

	app.config(config);
	
	config.$inject = [
		'$routeProvider', '$locationProvider'
	];
	
	function config($routeProvider, $locationProvider) {
		///
		// Tester Page
		///

		$routeProvider.when('/tester', {
			controller: 'TesterController',
			templateUrl: '/templates/tester.html'
		});


		///
		// About
		///

		$routeProvider.when('/about', {
			controller: 'AboutController',
			templateUrl: '/templates/about.html'
		});


		///
		// Account
		///

		$routeProvider.when('/account', {
			controller: 'AccountController',
			templateUrl: '/templates/account.html'
		});

		$routeProvider.when('/account/edit/:id', {
			controller: 'AccountEditController',
			templateUrl: '/templates/accountForm.html'
		});


		///
		// Championship
		///

		$routeProvider.when('/championship/:id', {
			controller: 'ChampionshipViewController',
			templateUrl: '/templates/championshipView.html'
		});


		///
		// Contact
		///

		$routeProvider.when('/contact', {
			controller: 'ContactController',
			templateUrl: '/templates/contact.html'
		});


		///
		// FAQ
		///

		$routeProvider.when('/faq', {
			controller: 'FaqController',
			templateUrl: '/templates/faq.html'
		});


		///
		// Home
		///

		$routeProvider.when('/', {
			controller: 'HomeController',
			templateUrl: '/templates/home.html'
		});


		///
		// Reservation
		///

		$routeProvider.when('/reservation/:id', {
			controller: 'ReservationDetailsController',
			templateUrl: '/templates/reservationDetails.html'
		});


		///
		// Story
		///

		$routeProvider.when('/story', {
			controller: 'StoryController',
			templateUrl: '/templates/story.html'
		});


		///
		// TOS
		///

		$routeProvider.when('/tos', {
			controller: 'TosController',
			templateUrl: '/templates/tos.html'
		});


		///
		// Other
		///

		$routeProvider.otherwise({
			redirectTo: '/'
		});


		///
		// HTML5 Routing (no hash)
		///
		
		$locationProvider.html5Mode(true);
	}

}());
