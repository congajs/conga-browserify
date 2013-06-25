
var fs = require('fs');
var path = require('path');

var async = require('async');
var browserify = require('browserify');

var BrowserifyHandler = function(){};

/**
 * Browserify all configured paths and create the bundled files
 * in the current app's public path
 * 
 * @param {Container} container
 * @param {Application} app
 * @param {Function} next
 * @returns {void}
 */
BrowserifyHandler.prototype.onAddMiddleware = function(container, app, next){

	var config = container.get('config').get('browserify');
	
	if (typeof config === 'undefined' || typeof config.bundles !== 'object'){
		next();
		return;
	}

	var calls = [];

	for(var i in config.bundles){

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
	async.parallel(calls, function(){
		next();
	});
};

module.exports = BrowserifyHandler;