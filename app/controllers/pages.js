/**
 * An example Nails pages controller
 */

md = require('node-markdown').Markdown;

this.home = function() {
	this.title = 'Home Page';
};

this.about = function() {
	fs.readFile('README.md', function(error, data) {
		this.title = 'About This Site';
		this.readme = md(data.toString());
	});
};

this.banner = function() {
	this.title = 'Banner Page';
	this.banner = this.request.params.message;
	this.render();
};
