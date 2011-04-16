/**
 * View handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

jade = require('jade');

this.renderAction = function(controller, action, context, request, response) {
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

global.view = this;