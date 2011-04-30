/**
 * An example Nails microposts controller
 */

this.new = function() {
	this.title = 'New Micropost';
};

this.create = function() {
	this.title = 'Micropost Created';
	this.micropost = this.request.params.micropost;
};