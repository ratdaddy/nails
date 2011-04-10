/**
 * Jasmine tests for the routing service
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require.paths.push('./nails');
require('router');

describe('#init', function() {
	it('should read the directory of cotnrollers', function() {
		fs = require('fs');
		spyOn(fs, 'readdir');
		
		router.init();
		
		expect(fs.readdir).toHaveBeenCalledWith('app/controllers', router.addController);
	});
});

describe('#addController', function() {
	it('should require the controller', function() {
		spyOn(router, 'require').andReturn({ action: '' });
		
		router.addController('', [ 'cont1.js', 'cont2.js' ]);
		
		expect(router.require.callCount).toEqual(2);
		expect(router.require.argsForCall[0]).toEqual([ 'app/controllers/cont1.js' ]);
		expect(router.require.argsForCall[1]).toEqual([ 'app/controllers/cont2.js' ]);
		
		expect(router.controllers).toEqual({ cont1: { action: '' }, cont2: { action: '' }});
	});
});

describe('#resetRoutes', function() {
	it('should reset the routes to an empty hash', function() {
		router['test route'] = 'test route';
		router.resetRoutes();
		expect(router.routes).toEqual({});
	});
});

describe('#match', function() {
	beforeEach(function() {
		router.resetRoutes();
	});
	
	it('adds a route', function() {
		router.match('route/path', 'controller#action');
		expect(router.routes).toEqual({ 'route/path':
				{ controller: 'controller', action: 'action' }});
	});
});

describe('#dispatch', function() {
	beforeEach(function() {
		router.resetRoutes();
		router.routes['/url'] = { controller: 'cont', action: 'action' };
	});
	
	it('does nothing if there is no matching url', function() {
		response = { writeHead: function() {}, end: function() {} };
		spyOn(response, 'writeHead');
		spyOn(response, 'end');
		
		router.dispatch('/bogus', null, response);
		
		expect(response.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
		expect(response.end).toHaveBeenCalled();
	});
	
	it('calls the action given a matching url', function() {
		mock = { action: function() {}};
		spyOn(mock, 'action');
		router.controllers['cont'] = mock;
		
		request = 'request';
		response = 'response';
		
		router.dispatch('/url', request, response);
		
		expect(mock.action).toHaveBeenCalledWith(request, response);
	});
});
