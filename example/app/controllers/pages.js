/**
 * An example Nails pages controller
 */

md = require('node-markdown').Markdown;

this.home = function() {
	this.title = 'Home Page';
};

this.altHome = function() {
	this.title = 'Alternate Home Page';
	this.render('home');
};

this.asyncHome = function() {
	setTimeout(this.wrapCallback(function() {
		this.title = 'Asynchronous Home Page';
		this.render();
	}), 10);
};

this.altAsyncHome = function() {
	setTimeout(this.wrapCallback(function() {
		this.title = 'Asynchronous Alternate Home Page';
		this.render('home');
	}), 10);
};

this.about = function() {
	fs.readFile('../README.md', function(error, data) {
		this.title = 'About This Site';
		this.readme = md(data.toString());
	});
};

this.banner = function() {
	this.title = 'Banner Page';
	this.banner = this.request.params.message;
	this.render();
};
