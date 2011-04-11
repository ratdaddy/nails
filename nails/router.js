/**
 * URL path router
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

fs = require('fs');

this.routes = {};
this.controllers = {};

this.init = function() {
	fs.readdir('app/controllers', this.addController);
};

this.addController = function(error, controller) {
	if (error) {
		console.log('Error reading controller directory: ' + error.message);
	}
	else {
		for (x in controller) {
			file = controller[x];
			basename = file.substr(0, file.indexOf('.'));
			if (basename.length > 0) {
				try {
					router.controllers[basename] = router.require('app/controllers/' + file);
				}
				catch (e) {
					console.log('Error reading controller file: ' + file + ': ' + e.message);
				}
			}
		}
	}
};

this.require = function(module) {
	return require(module);
};

this.reset = function() {
	this.routes = {};
	this.controllers = {};
};

this.match = function(route_path, controller_action) {
	this.routes[route_path] = parseController(controller_action);
};

function parseController(controller_action) {
	parts = controller_action.split('#');
	return { controller: parts[0], action: parts[1] };
}

this.dispatch = function(url, request, response) {
	if (url in this.routes) {
		cont_act = this.routes[url];
		this.controllers[cont_act.controller][cont_act.action](request, response);
	}
	else {
		fs.readFile('public' + url, function(error, data) {
			if (error) {
				response.writeHead(404, { 'Content-Type': 'text/plain' });
				response.write('Not found: ' + url);
			}
			else {
				response.write(data);
			}
			response.end();
		});
	}
};

global['router'] = this;
