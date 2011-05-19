Nails: A Rails-like framework for Node.js
=======

This is an early experiment to try and provide a Ruby on Rails style framework for
[Node.js](http://nodejs.org/). The intent is to provide many of the goodies that Rails has:
generators, MVC, RESTful services, etc.

Installation
--------

Nails is currently only available from [GitHub](http://github.com/ratdaddy/nails) as a download.
It can be installed with [npm](https://github.com/isaacs/npm) by issuing the command:

	$ npm install -g https://github.com/ratdaddy/nails/tarball/master

Nails requires and works with [CoffeeScript](http://jashkenas.github.com/coffee-script/). You
must install CoffeeScript:

	$ npm install -g coffee-script


Creating a Nails Application
---------

To create a skeleton Nails application in the directory <code>my_app</code> run:

	$ nails new my_app

Routes and Actions
-----

At the present time Nails doesn't do much more than route the path portion of the URL to an action
function in a controller module. New routes can be added to the <code>config/routes.js</code> file
and look something like:

	router.match('/home', 'pages#home');
	router.match('/about', 'pages#about');	

The first parameter is the path portion of the url and the second is a string of the form:
<code>controller#action</code>.

The controller modules (JavaScript files with an extension of <code>.js</code>) are located in
<code>app/controllers</code>. Nails attempts to load
all JavaScript files in that directory with the file basename becoming the controller name
referenced by <code>router.match()</code>.

Actions themselves look like:

	this.home = function() {
		this.templateVariable = 'some value';
	};

Where in this example <code>home</code> is the action name referenced by
<code>router.match()</code>. Variables set in <code>this</code> are available as local variables
in the corresponding template.

Templates
-------

Nails currently uses [EJS](http://embeddedjs.com/) for its templating system. Template files for a given controller/action
pair are located in <code>app/views/controller/action.ejs</code> (substitute the controller and
action names appropriately).

A template might look something like:

	<html>
		<body>
			<h1><%= templateVariable %></h1>
		</body>
	</html>
	
which, when using the example action above would present a page containing <code>some value</code>
set as an h1 header.

Running
-------

After the proper routes have been added and  controller/action pairs and view templates have been written
you can run
Nails from the application's top-level (home) directory:

	$ nails server

You can now access your server by pointing a browser on the same computer to <code>http://localhost:3000</code>.

License
-------

Copyright (c) 2011 Brian VanLoo. Nails is licensed under the
[MIT License](https://github.com/ratdaddy/nails/raw/master/LICENSE)
