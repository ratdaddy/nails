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
		context = { controller: 'cont', action: 'action' };
	});
	
	it('saves the ejs filename', function() {
		view.renderAction(context);
		
		expect(context.renderFilename).toEqual('app/views/cont/action.ejs');
	});
	
	it('reads the ejs file', function() {
		spyOn(fs, 'readFile');
		
		view.renderAction(context);
		
		expect(fs.readFile).toHaveBeenCalledWith('app/views/cont/action.ejs', 'ascii',
				any(Function));
	});
	
	it('binds the context to the renderEJSData function', function() {
		spyOn(us, 'bind');
		
		view.renderAction(context);
		
		expect(us.bind).toHaveBeenCalledWith(view.renderEJSData, context);
	});

	describe('#renderEJSData', function() {
		beforeEach(function() {
			response = context.response = { writeHead: function() {}, end: function() {} };

			context.renderFilename = '/test/file/name.ejs';	
			
			spyOn(response, 'writeHead');
			spyOn(response, 'end');
		});
		
		describe('a succesful render', function() {
			beforeEach(function() {
				spyOn(ejs, 'render').andReturn('rendered data');
				us.bind(view.renderEJSData, context)(null, 'ejs content');
			});
			
			it('calls the ejs renderer', function() {
				expect(ejs.render).toHaveBeenCalledWith('ejs content', context);
			});
			
			it('writes an html header', function() {
				expect(response.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
			});
			
			it('outputs the data', function() {
				expect(response.end).toHaveBeenCalledWith('rendered data');
			});
		});
		
		describe('an error while rendering', function() {
			beforeEach(function() {
				spyOn(ejs, 'render').andThrow(new Error('rendering error'));
				us.bind(view.renderEJSData, context)(null, null);
			});
			
			it('outputs the ejs error', function() {
				expect(response.end.mostRecentCall.args[0]).toContain('rendering error');
			});
			
			it('outputs the filename', function() {
				expect(response.end.mostRecentCall.args[0]).toContain('/test/file/name.ejs');
			});
		});
		
		describe('a file read error', function() {
			beforeEach(function() {
				us.bind(view.renderEJSData, context)(new Error('file read error'));
			});
			
			it('outputs the file read error', function() {
				expect(response.end.mostRecentCall.args[0]).toContain('file read error');
			});
		});
	});
});