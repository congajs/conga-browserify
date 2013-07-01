/*
 * This file is part of the conga-browserify module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// built-in modules
var fs = require('fs');
var path = require('path');

// third-party modules
var browserify = require('browserify');

/**
 * Browserify uses browserify to create bundled files of
 * server-side modules for client-side usage
 */
var Browserify = function(){};

Browserify.prototype = {

	/**
	 * Browserify all configured paths and create the bundled files
	 * in the current app's public path
	 * 
	 * @param {Container} container
	 * @param {Application} app
	 * @param {Function} next
	 * @returns {void}
	 */
	onAddMiddleware: function(container, app, next){

		var config = container.get('config').get('browserify');
		
		if (typeof config === 'undefined' || typeof config.bundles !== 'object'){
			next();
			return;
		}

		var calls = [];

		for (var i in config.bundles){

			var bundleConfig = config.bundles[i];

			(function(c){

				calls.push(function(cb){

					var b = browserify();

					// add all the source files
					c.src.forEach(function(file){
						var filePath = container.get('namespace.resolver').resolveWithSubpath(file, 'lib');
						b.add(filePath);
						b.require(filePath, { expose : c.expose });
					});

					// create and write the bundle file
					b.bundle(function(err, src){
						fs.writeFile(path.join(container.getParameter('kernel.app_public_path'), c.path), src, function(err){
							cb();
						});
					});
				});

			}(bundleConfig));
		}

		// build the files
		container.get('async').parallel(calls, function(){
			next();
		});
	}
};

module.exports = Browserify;