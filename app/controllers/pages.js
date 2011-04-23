/**
 * An example Nails pages controller
 */

this.home = function() {
	this.title = 'Home Page';
};

this.about = function() {
	func = this.wrapCallback(function() {
		this.title = 'About This Site';
	});
	setTimeout(func, 1);
};

this.banner = function() {
	this.title = 'Banner Page';
	this.banner = this.request.params.message;
};
