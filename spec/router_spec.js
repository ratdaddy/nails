/**
 * Jasmine tests for the routing service
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require.paths.push('./nails');
require('router');
require('view');

describe('#init', function() {
	it ('should read the directory of controllers', function() {
		spyOn(router, 'addControllers');
		
		router.init();
		
		expect(router.addControllers).toHaveBeenCalled();
	});
});

describe('#addControllers', function() {
	beforeEach(function() {
		router.reset();
	});
	
	it('should require the controller', function() {
		spyOn(fs, 'readdirSync').andReturn([ 'cont1.js', 'cont2.js.x', '.cont3', 'cont4' ]);
		spyOn(router, 'require').andReturn({ action: '' });
		
		router.addControllers();
		
		expect(fs.readdirSync).toHaveBeenCalledWith('app/controllers');
		
		expect(router.require.callCount).toEqual(3);
		expect(router.require.argsForCall[0]).toEqual([ 'app/controllers/cont1.js' ]);
		expect(router.require.argsForCall[1]).toEqual([ 'app/controllers/cont2.js.x' ]);
		expect(router.require.argsForCall[2]).toEqual([ 'app/controllers/cont4' ]);
		
		expect(router.controllers).toEqual({ cont1: { action: '' }, cont2: { action: '' },
				cont4: { action: '' }});
	});
	
	it('should handle syntax errors on read', function() {
		spyOn(fs, 'readdirSync').andReturn([ 'cont.js' ]);
		spyOn(console, 'log');
		spyOn(router, 'require').andThrow(new Error('Require Error'));
		
		router.addControllers();
		
		expect(console.log.mostRecentCall.args[0]).toContain('cont.js');
		expect(console.log.mostRecentCall.args[0]).toContain('Require Error');
		expect(router.controllers).toEqual({});
	});
	
	it('should handle an error passed in from readdir', function() {
		spyOn(fs, 'readdirSync').andThrow(new Error('Test Error'));
		spyOn(console, 'log');
		spyOn(router, 'require').andReturn({ action: '' });

		router.addControllers();
		
		expect(console.log.mostRecentCall.args[0]).toContain('Test Error');
		expect(router.controllers).toEqual({});
	});
});

describe('#reset', function() {
	it('should reset the routes to an empty hash', function() {
		router.routes['test route'] = 'test route';
		router.controllers['test controller'] = 'test controller';
		
		router.reset();
		
		expect(router.routes).toEqual({});
		expect(router.controllers).toEqual({});
	});
});

describe('#match', function() {
	beforeEach(function() {
		router.reset();
	});
	
	it('should add a route', function() {
		router.match('route/path', 'controller#action');
		expect(router.routes).toEqual({ 'route/path':
				{ controller: 'controller', action: 'action' }});
	});
});

describe('Dispatcher', function() {
	beforeEach(function() {
		router.reset();
		router.routes['/url'] = { controller: 'cont', action: 'action' };
		
		request = 'request';
		response = { writeHead: function() {}, end: function() {} };
	});
	
	describe('#dispatch', function() {
		it('should respond with 404 if there is no matching url or static file', function() {
			spyOn(response, 'writeHead');
			spyOn(response, 'end');
			spyOn(fs, 'readFile').andCallFake(function(error, callback) {
				callback({ message: 'Not Found' });
			});
			
			router.dispatch('/bogus', null, response);
			
			expect(response.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
			expect(response.end.mostRecentCall.args[0]).toEqual('Not found: /bogus');
			expect(response.end).toHaveBeenCalled();
		});
		
		it('should get a static file if no matching url', function() {
			spyOn(response, 'end');
			spyOn(fs, 'readFile').andCallFake(function(error, callback) {
				callback(null, 'Test Data');
			});
	
			router.dispatch('/file.ext', null, response);
			
			expect(fs.readFile.mostRecentCall.args[0]).toEqual('public/file.ext');
			expect(response.end).toHaveBeenCalledWith('Test Data');
	 	});
		
		it('should call the action given a matching url', function() {
			spyOn(router, 'dispatchAction');
			
			router.dispatch('/url', request, response);
			
			expect(router.dispatchAction).toHaveBeenCalledWith(router.routes['/url'],
					request, response);
		});
	});

	describe('#dispatchAction', function() {
		beforeEach(function() {
			action_method = { action: function() {}};
			spyOn(action_method, 'action');
			router.controllers['cont'] = action_method;
			
			spyOn(us, 'bind').andCallFake(function(func, object, req, res) {
				object.member = 'test';
				return function() { func(req, res); };
			});
			
			spyOn(view, 'renderAction');
		});
		
		it('should call the action once', function() {
			router.dispatchAction(router.routes['/url'], request, response);
			
			expect(action_method.action.callCount).toEqual(1);
			expect(action_method.action).toHaveBeenCalledWith(request, response);
		});
			
		it('should call the view renderer', function() {
			router.dispatchAction(router.routes['/url'], request, response);

			expect(view.renderAction).toHaveBeenCalledWith('cont', 'action',
					{ locals: { member: 'test' }}, request, response);
		});
	});
});

