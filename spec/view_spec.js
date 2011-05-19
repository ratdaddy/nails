/**
 * Jasmine tests for view handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require.paths.push('./lib');
require('view');

describe('#render', function() {
	beforeEach(function() {
		view.context = {};
		spyOn(view, 'renderAction');
	});
	
	it('calls renderAction if not async', function() {
		view.render();
		
		expect(view.renderAction).toHaveBeenCalledWith(view.context);
	});
	
	it('does not call renderAction if async', function() {
		view.wrapCallback(function() {});
		view.render();
		
		expect(view.renderAction).not.toHaveBeenCalled();
	});
	
	it('calls only calls the first time it is called', function() {
		view.render();
		view.render();

		expect(view.renderAction.callCount).toEqual(1);
	});
});

describe('#wrapCallback', function() {
	beforeEach(function() {
		spyOn(view, 'renderAction');
		view.context = {};
	});
	
	it('sets the async flag', function() {
		view.wrapCallback(function() {});
		
		expect(view.context.async).toBeTruthy();
	});
	
	it('binds the callback to context.locals', function() {
		view.context.locals = 'test locals';
		
		var the_context;

		view.wrapCallback(function() { the_context = this; })();
		
		expect(view.context.locals).toEqual(the_context);
	});
	
	it('calls the callback with error and data', function() {
		mock = { callback: function() {}};
		spyOn(mock, 'callback');
		
		view.wrapCallback(mock.callback)('error', 'data');
		
		expect(mock.callback).toHaveBeenCalledWith('error', 'data');
	});
	
	it('calls view#renderAction only after callback is executed', function() {
		callback = view.wrapCallback(function() {});
		
		expect(view.renderAction).not.toHaveBeenCalled();
		
		callback();
		
		expect(view.renderAction).toHaveBeenCalledWith(view.context);
	});
});

describe('#renderAction', function() {
	beforeEach(function() {
		spyOn(fs, 'readFile');
		context = { controller: 'cont', action: 'action', locals: {}};
	});
	
	it('saves the ejs filename', function() {
		view.renderAction(context);
		
		expect(context.renderFilename).toEqual('app/views/cont/action.ejs');
	});
	
	it('reads the ejs file', function() {
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
			response = context.locals.response = { writeHead: function() {}, end: function() {} };

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
