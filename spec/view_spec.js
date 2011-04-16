/**
 * Jasmine tests for view handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require.paths.push('./nails');
require('view');

describe('#renderAction', function() {
	beforeEach(function() {
		request = 'request';
		response = { writeHead: function() {}, end: function() {} };
		
		spyOn(response, 'writeHead');
		spyOn(response, 'end');
	});
	
	describe('successful render', function() {
		beforeEach(function() {
			spyOn(jade, 'renderFile').andCallFake(function(path, locals, func) {
				func(null, 'Test HTML');
			});
		});

		it('should call the jade templater', function() {
			view.renderAction('cont', 'action', { locals: { member: 'test' }}, request, response);

			expect(jade.renderFile.mostRecentCall.args[0]).toEqual('app/views/cont/action.jade');
			expect(jade.renderFile.mostRecentCall.args[1]).toEqual({ locals: { member: 'test' }});
			expect(response.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
			expect(response.end).toHaveBeenCalledWith('Test HTML');
		});
	});
	
	it('should handle template errors', function() {
		spyOn(jade, 'renderFile').andCallFake(function(path, locals, func) {
			func({ message: 'jade error' });
		});
		
		view.renderAction(null, null, null, request, response);
		
		expect(response.end.mostRecentCall.args[0]).toContain('jade error');
	});
});