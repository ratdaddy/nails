/**
 * View handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

jade = require('jade');

this.render = function(callback) {
	if (typeof callback == 'function') {
		this.context.async = true;
		return us.bind(function(error, data) {
			us.bind(callback, this.context.locals)(error, data);
			view.renderAction(this.context);
		}, this);
	}
	else {
		if (!this.context.async) {
			view.renderAction(this.context);
		}
	}
};

this.renderAction = function(context) {
	jadefile = 'app/views/' + context.controller + '/' + context.action + '.jade';
	jade.renderFile(jadefile, context, function(error, html) {
		if (error) {
			context.response.end(error.message);
		}
		else {
			context.response.writeHead(200, { 'Content-Type': 'text/html' });
			context.response.end(html);
		}
	});		
};

global.view = this;