Nails: A Rails-like framework for Node.js
=======

This is an early experiment to try and provide a Ruby on Rails style framework for
[Node.js](http://nodejs.org/). The intent is to provide many of the goodies that Rails has:
generators, MVC, RESTful services, etc.

Installation
--------

Nails is currently only available from [GitHub](http://github.com) as a download. It doesn't yet
use a fancy npm installation and the Nails code to run the application itself is mixed in to the
same directory structure as the application.

Installation is simply a matter of downloading the files and copying the directory structure to the
directory you want your application to live in.

Usage
-----

At the present time Nails doesn't do much more than route path portion of the URL to an action
function in a controller module. New routes can be added to the <code>config/routes.js</code> file
and look something like:

	router.match('/home', 'pages#home');
	router.match('/about', 'pages#about');	

The first parameter is the path portion of the url and the second is a string of the form:
<code>controller#action</code>.

The controller modules (JavaScript files with an extension of <code>.js</code>) are located in app/controllers. Nails attempts to load
all JavaScript files in that directory with the file basename becoming the controller name
referenced by <code>router.match()</code>.

Actions themselves look like:

	this.home = function(req, res) {
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('pages#home');
	};

Where in this example <code>home</code> is the action name referenced by
<code>router.match()</code>. The action function itself behaves essentially the same as the
function passed to [Node.js](http://nodejs.org) <code>http.createServer()</code>.

Running
-------

After the proper routes have been added and controller/action pairs have been written you can run
Nails from the application's top-level (home) directory:

	$ script/nails

You can now access your server by pointing a browser on the same server as your application is
running on to <code>http://localhost:3000</code>

License
-------

Copyright (c) 2011 Brian VanLoo. Nails is licensed under the
[MIT License](https://github.com/ratdaddy/nails/raw/master/LICENSE)
