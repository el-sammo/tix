/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
	// 'styles/**/*.css'
	'index.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [
	
	// Load sails.io before everything else
	// 'js/dependencies/sails.io.js',

	// Dependencies like jQuery, or Angular are brought in here
	// 'js/dependencies/**/*.js',

	// All of the rest of your client-side js files
	// will be injected here in no particular order.
	// 'js/**/*.js'
	
	'packages/angular-bootstrap/ui-bootstrap-tpls.min.js',
	'packages/angular-payments/lib/angular-payments.min.js',
	'packages/angular-google-maps/dist/angular-google-maps.min.js',
	'packages/holderjs/holder.js',
	'packages/moment/moment.js',
	'packages/bluebird/bluebird.js',
	'packages/lodash/lodash.min.js',
	'packages/bootstrap/dist/js/bootstrap.min.js',
	'packages/bootstrap-tour/build/js/bootstrap-tour.min.js',
	'packages/angular-bootstrap-tour/dist/angular-bootstrap-tour.min.js',
	'app.js',
	'local.js',
	// 'datatables.js',

	// Analytics
	'packages/angulartics/dist/angulartics.min.js',
	'packages/angulartics/dist/angulartics-ga.min.js',

	// Other local files
	'directives/**/*.js',
	'services/**/*.js',
	'controllers/**/*.js',

	// Routes
	'app.routes.js',
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  // 'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});
