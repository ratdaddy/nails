/**
 * URL path router
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

fs = require('fs');
us = require('underscore');
qs = require('querystring');

this.routes = [];
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
	this.routes = [];
	this.controllers = {};
};

this.match = function(route_path, controller_action, options) {
	this.routes.push(parseController(route_path, controller_action, options));
};

function parseController(route_path, controller_action, options) {
	options = options || {};
	if (options.via) {
		if (us.isArray(options.via)) {
			via = us.map(options.via, function(item) { return item.toUpperCase(); });
		}
		else {
			via = options.via.toUpperCase();
		}
	}
	else {
		via = 'ANY';
	}
	
	parts = controller_action.split('#');
	paths = route_path.substr(1).split('/');

	path_regex = '';
	params = [];
	us.each(paths, function(part) {
		if (part.charAt(0) != ':') {
			path_regex += '/' + part;
		}
		else {
			path_regex += '/([^/]+)';
			params.push(part.substr(1));
		};
	});
	
	return { path: { regex: new RegExp('^' + path_regex + '$'), params: params },
			controller: parts[0], action: parts[1], via: via };
}

this.dispatch = function(url, request, response) {

	if (route = us.detect(this.routes, function(rte) {
		match = rte.path.regex.exec(url);
		return match && (rte.via == 'ANY' || (rte.via.indexOf(request.method) != -1));
	})) {
		request.params = {};
		us.each(route.path.params, function(param, idx) {
			request.params[param] = match[idx + 1];
		});
		
		if (request.method == 'POST') {
			this.dispatchPost(route, request, response);
		}
		else {
			this.dispatchAction(route, request, response);
		}
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

this.dispatchPost = function(route, request, response) {
	var fullBody = '';
	
	request.on('data', function(data) {
		fullBody += data.toString();
	});
	
	request.on('end', function() {
		this.finished = true;
		request.params = request.params || {};
		us.extend(request.params, parseParams(fullBody));
		router.dispatchAction(route, request, response);
	});
};

function parseParams(queryString) {
	rawParams = qs.parse(queryString);
	params = {};
	us.each(rawParams, function(value, key) {
        value = value.replace(/\r\n/g, '\n');
		if (obj = key.match(/(.*)\[(.+)\]/)) {
			if (us.isUndefined(params[obj[1]])) {
				params[obj[1]] = {};
			}
			params[obj[1]][obj[2]] = value;
		}
		else {
			params[key] = value;
		}
	});
	
	return params;
}

this.dispatchAction = function(route, request, response) {
	controller = route.controller;
	action = route.action;
	
	context = { controller: controller, action: action, locals: { request: request,
			response: response }};
	
	context.locals.render = us.bind(view.render, { context: context });
	context.locals.wrapCallback = us.bind(view.wrapCallback, { context: context });
	context.locals.redirect_to = us.bind(view.redirect_to, { context: context });
	
	us.bind(this.controllers[controller][action], context.locals)();
	
	us.bind(view._render, { context: context })();
};

function fileReadError(url, response) {
	response.writeHead(404, { 'Content-Type': 'text/plain' });
	response.end('Not found: ' + url);	
}

function sendFile(data, response) {
	response.end(data);
}

global.router = this;
