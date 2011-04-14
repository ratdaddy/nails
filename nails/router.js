/**
 * URL path router
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

fs = require('fs');
jade = require('jade');
us = require('underscore');

this.routes = {};
this.controllers = {};

this.init = function() {
	this.addControllers();
};

this.addControllers = function() {
	try {
		controller_files = fs.readdirSync('app/controllers');
		for (x in controller_files) {
			readController(controller_files[x]);
		}
	}
	catch(e) {
		console.log('Error reading controller directory: ' + e.message);
	}
};

function readController(filename) {
	basename = (index = filename.indexOf('.')) < 0 ? filename : filename.substr(0, index);
	if (basename.length > 0) {
		try {
			router.controllers[basename] = router.require('app/controllers/' + filename);
		}
		catch (e) {
			console.log('Error reading controller file: ' + filename + ': ' + e.message);
		}
	}
}

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
		this.dispatchAction(this.routes[url], request, response);
	}
	else {
		fs.readFile('public' + url, function(error, data) {
			if (error) {
				fileReadError(url, response);
			}
			else {
				sendFile(data, response);
			}
		});
	}
};

this.dispatchAction = function(route, request, response) {
	controller = route.controller;
	action = route.action;
	
	context = { locals: {} };
	us.bind(this.controllers[controller][action], context['locals'], request, response)();
	
	jade.renderFile('app/views/' + controller + '/' + action + '.jade', context,
			function(error, html) {
		if (error) {
			response.end(error.message);
		}
		else {
			response.writeHead(200, { 'Content-Type': 'text/html' });
			response.end(html);
		}
	});
};

function fileReadError(url, response) {
	response.writeHead(404, { 'Content-Type': 'text/plain' });
	response.end('Not found: ' + url);	
}

function sendFile(data, response) {
	response.end(data);
}

global['router'] = this;
