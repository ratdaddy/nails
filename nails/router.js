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
	for (x in controller) {
		file = controller[x];
		basename = file.substr(0, file.length - 3);
		router.controllers[file.substr(0, file.length - 3)] = 
				router.require('app/controllers/' + file);
	}
};

this.require = function(module) {
	return require(module);
};

this.resetRoutes = function() {
	this.routes = {};
};

this.match = function(route_path, controller_action) {
	this.routes[route_path] = parseController(controller_action);
};

function parseController(controller_action) {
	parts = controller_action.split('#');
	return { controller: parts[0], action: parts[1] };
}

this.dispatch = function(url, request, result) {
	if (url in this.routes) {
		cont_act = this.routes[url];
		this.controllers[cont_act.controller][cont_act.action](request, result);
	}
	else {
		result.writeHead(404, { 'Content-Type': 'text/plain' });
		result.end();
	}
};

global['router'] = this;
