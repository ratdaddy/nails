/**
 * Nails bootstrap
 * 
 * Copyright (c) 2011 Brian VanLoo
 */

require('router');
require('config/routes.js');

router.init();

var http = require('http');

http.createServer(function(request, response) {
	router.dispatch(request.url, request, response);
}).listen(3000);