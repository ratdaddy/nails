/**
 * An example Nails pages controller
 */

this.home = function(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('pages#home');
};