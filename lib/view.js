/**
 * View handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

ejs = require('ejs');

this.redirect_to = function(url) {
	this.context.locals.response.writeHead(303, { Location: url });
	this.context.locals.response.end();
	this.context.hasBeenRendered = true;
};

this.render = function(action) {
	if (!this.context.async && !this.context.hasBeenRendered) {
		view.renderAction(this.context, action);
		this.context.hasBeenRendered = true;
	}
};

this.wrapCallback = function(callback) {
	this.context.async = true;
	return us.bind(function(error, data) {
		us.bind(callback, this.context.locals)(error, data);
		view.renderAction(this.context);
	}, this);
};

this.renderAction = function(context, altAction) {
	context.renderFilename = 'app/views/' + context.controller + '/' +
			(altAction ? altAction : context.action) + '.ejs';
	fs.readFile(context.renderFilename, 'ascii', us.bind(this.renderEJSData, context));
};

this.renderEJSData = function(error, data) {
	if (error) {
		this.locals.response.end('render error reading file: ' + error.message);
	}
	else {
		try {
			rendered = ejs.render(data, this);
		}
		catch(e) {
			this.locals.response.end('EJS error rendering file: ' + this.renderFilename + ': ' +
					e.message);
			return;
		}
			
		this.locals.response.writeHead(200, { 'Content-Type': 'text/html' });
		this.locals.response.end(rendered);
	}
};

global.view = this;
