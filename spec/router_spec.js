/**
 * Jasmine tests for the routing service
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require.paths.push('./nails');
require('router');
require('view');

context = describe;

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
		
		expect(router.routes).toEqual([]);
		expect(router.controllers).toEqual({});
	});
});

describe('#match', function() {
	beforeEach(function() {
		router.reset();
	});
	
	it('sets the controller and action', function() {
		router.match('/anypath', 'controller#action');
		
		expect(router.routes[0].controller).toEqual('controller');
		expect(router.routes[0].action).toEqual('action');
	});
	
	context('fixed path', function() {
		it('adds a simple regular expression matcher with no paramaeter names', function() {
			router.match('/route/path', 'controller#action');

			expect('' + router.routes[0].path.regex).toEqual('' + new RegExp('^/route/path$'));
			expect(router.routes[0].path.params).toEqual([]);
		});
	});
	
	context('path with a parameter', function() {
		it('adds a paramater-matching regular expression with parameter names', function() {
			router.match('/route/:param1/path/:param2', 'controller#action');
			
			expect('' + router.routes[0].path.regex).
					toEqual('' + new RegExp('^/route/([^/]+)/path/([^/]+)$'));
			expect(router.routes[0].path.params).toEqual(['param1', 'param2']);
		});
	});
	
	context('via option', function() {
		it('adds via ANY if nothing specified', function() {
			router.match('/path', 'controller#action');
			
			expect(router.routes[0].via).toEqual('ANY');
		});
		
		it('adds a single valid via', function() {
			router.match('/path', 'controller#action', { via: 'get' });
			
			expect(router.routes[0].via).toEqual('GET');
		});
		
		it('adds multiple valid vias', function() {
			router.match('/path', 'controller#action', { via: [ 'get', 'put' ] });

			expect(router.routes[0].via).toEqual([ 'GET', 'PUT' ]);
		});
	});
});

describe('Dispatcher', function() {
	beforeEach(function() {
		router.reset();
		router.routes.push({
			path: { regex: new RegExp('^/url$'), params: [] },
			controller: 'cont',
			action: 'action',
			via: 'ANY'
		});
		router.routes.push({
			path: {
				regex: new RegExp('^/route/([^/]+)/path/([^/]+)$'),
				params: [ 'param1', 'param2' ]
			},
			controller: 'cont',
			action: 'action',
			via: 'ANY'
		});
		
		req = { request: 'request' };
		res = { writeHead: function() {}, end: function() {} };
	});
	
	describe('#dispatch', function() {
		it('should respond with 404 if there is no matching url or static file', function() {
			spyOn(res, 'writeHead');
			spyOn(res, 'end');
			spyOn(fs, 'readFile').andCallFake(function(error, callback) {
				callback({ message: 'Not Found' });
			});
			
			router.dispatch('/bogus', null, res);
			
			expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
			expect(res.end.mostRecentCall.args[0]).toEqual('Not found: /bogus');
		});
		
		it('should get a static file if no matching url', function() {
			spyOn(res, 'end');
			spyOn(fs, 'readFile').andCallFake(function(error, callback) {
				callback(null, 'Test Data');
			});
	
			router.dispatch('/file.ext', null, res);
			
			expect(fs.readFile.mostRecentCall.args[0]).toEqual('public/file.ext');
			expect(res.end).toHaveBeenCalledWith('Test Data');
	 	});
		
		context('dispatches an action', function() {
			beforeEach(function() {
				spyOn(router, 'dispatchAction');
			});
		
			it('calls the action given a matching url', function() {
				router.dispatch('/url', req, res);
				
				expect(router.dispatchAction).toHaveBeenCalledWith(router.routes[0], req, res);
			});
			
			it('sets params array to be empty for path with no params', function() {
				router.dispatch('/url', req, res);
				
				expect(req.params).toEqual({});
			});
			
			it('sets params array with params from the path', function() {
				router.dispatch('/route/p1/path/p2', req, res);
				
				expect(req.params).toEqual({ param1: 'p1', param2: 'p2' });
			});
			
			context('single via set', function() {
				beforeEach(function() {
					singleVia = router.routes.push({
						path: { regex: new RegExp('^/get$'), params: [] },
						controller: 'cont',
						action: 'getAction',
						via: 'GET'
					}) - 1;
					multiVia = router.routes.push({
						path: { regex: new RegExp('^/get-post$'), params: [] },
						controller: 'cont',
						action: 'getAction',
						via: [ 'GET', 'POST' ]
					}) - 1;
				});
				
				it('calls dispatch when the method matches single via', function() {
					req.method = 'GET';
					router.dispatch('/get', req, res);
					
					expect(router.dispatchAction).toHaveBeenCalledWith(router.routes[singleVia],
							req, res);
				});
				
				it('calls dispatch when the method matches a set of vias', function() {
					req.method = 'POST';
					router.dispatch('/get-post', req, res);
					
					expect(router.dispatchAction).toHaveBeenCalledWith(router.routes[multiVia],
							req, res);
				});
				
				it('does not dispatch when the method does not match via', function() {
					req.method = 'PUT';
					router.dispatch('/get', req, res);
					
					expect(router.dispatchAction).not.toHaveBeenCalled();
				});
			});
		});
	});

	describe('#dispatchAction', function() {
		beforeEach(function() {
			action_method = { action: function() {}};
			router.controllers['cont'] = action_method;
			
			spyOn(action_method, 'action').andCallFake(function() { action_context = this; });
			spyOn(view, 'render').andCallFake(function() { render_context = this; });
			spyOn(view, 'wrapCallback').andCallFake(function() { wrapCallback_context = this; });

			router.dispatchAction(router.routes[0], req, res);
		});

		it('calls the right action', function() {
			expect(action_method.action).toHaveBeenCalled();
		});
		
		it('sets the right context for the wrapCallback function', function() {
			action_context.render();
			action_context.wrapCallback();
			
			expect(wrapCallback_context).toEqual(render_context);
		});
		
		it('calls the render function', function() {
			expect(view.render).toHaveBeenCalled();
		});
		
		it('sets controller in the render context', function() {
			expect(render_context.context.controller).toEqual('cont');
		});	
		
		it('sets action in the render context', function() {
			expect(render_context.context.action).toEqual('action');
		});
		
		it('passes locals in the render context', function() {
			expect(render_context.context.locals).toEqual(action_context);
		});
		
		it('sets locals.request in the render context', function() {
			expect(render_context.context.locals.request).toEqual(req);
		});
		
		it('sets locals.response in the render context', function() {
			expect(render_context.context.locals.response).toEqual(res);
		});
	});
});

