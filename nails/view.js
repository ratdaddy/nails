/**
 * View handling
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

jade = require('jade');
ejs = require('ejs');

this.render = function(callback) {
	if (!this.context.async) {
		view.renderAction(this.context);
	}
};

this.wrapCallback = function(callback) {
	this.context.async = true;
	return us.bind(function(error, data) {
		us.bind(callback, this.context.locals)(error, data);
		view.renderAction(this.context);
	}, this);
};

this.renderAction = function(context) {
	context.renderFilename = 'app/views/' + context.controller + '/' + context.action + '.ejs';
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