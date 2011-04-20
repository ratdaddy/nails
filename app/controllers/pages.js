/**
 * An example Nails pages controller
 */

this.home = function(req, res) {
	this.title = 'Home Page';
};

this.about = function(req, res) {
	func = this.render(function() {
		this.title = 'About This Site';
	});
	setTimeout(func, 1);
};

this.banner = function(req, res) {
	this.title = 'Banner Page';
	this.banner = req.params.message;
};
