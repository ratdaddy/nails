/**
 * Jasmine tests for view handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require.paths.push('./nails');
require('view');

describe('#render', function() {
	beforeEach(function() {
		view.context = {};
	});
	
	describe('with callback', function() {
		it('should return a function', function() {
			expect(typeof view.render(function() {})).toEqual('function');
		});
		
		it('should set the async flag', function() {
			view.render(function() {});
			
			expect(view.context.async).toBeTruthy();
		});
	
		it ('should bind the callback to context', function() {
			mock = { func: function() {}};
			spyOn(us, 'bind').andCallThrough();
			spyOn(mock, 'func');
			spyOn(view, 'renderAction');
			
			view.context.locals = 'test locals';
			context = view.context;
			
			callback = us.bind(view.render, { context: context })(mock.func);
			callback('error', 'data');
			
			expect(us.bind.callCount).toEqual(3);
			expect(us.bind).toHaveBeenCalledWith(mock.func, context.locals);
			expect(mock.func).toHaveBeenCalledWith('error', 'data');
			expect(view.renderAction).toHaveBeenCalledWith(context);
		});
	});
	
	describe('without callback', function() {
		beforeEach(function() {
			spyOn(view, 'renderAction');
		});
		
		it('should return nothing', function() {
			expect(view.render()).not.toBeDefined();
		});
		
		it('should call renderAction if not async', function() {
			view.render();
			
			expect(view.renderAction).toHaveBeenCalledWith(view.context);
		});
		
		it('should not call renderAction if async ', function() {
			view.render(function() {});
			view.render();
			
			expect(view.renderAction).not.toHaveBeenCalled();
		});
	});
});

describe('#renderAction', function() {
	beforeEach(function() {
		request = 'request';
		response = { writeHead: function() {}, end: function() {} };
		context = { controller: 'cont', action: 'action', locals: { member: 'test' },
				request: request, response: response };
		
		spyOn(response, 'writeHead');
		spyOn(response, 'end');
	});

	it('should call the jade templater', function() {
		spyOn(jade, 'renderFile').andCallFake(function(path, locals, func) {
			func(null, 'Test HTML');
		});
		
		view.renderAction(context);

		expect(jade.renderFile.mostRecentCall.args[0]).toEqual('app/views/cont/action.jade');
		expect(jade.renderFile.mostRecentCall.args[1]).toEqual(context);
		expect(response.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
		expect(response.end).toHaveBeenCalledWith('Test HTML');
	});
	
	it('should handle template errors', function() {
		spyOn(jade, 'renderFile').andCallFake(function(path, locals, func) {
			func({ message: 'jade error' });
		});
		
		view.renderAction(context);
		
		expect(response.end.mostRecentCall.args[0]).toContain('jade error');
	});
});