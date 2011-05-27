/**
 * Application routes
 */


// Basic route matching builds a mapping of a url directory to a controller/action pair:
//
// 		router.match('/home', 'pages#home');
// 		router.match('/about', 'pages#about');
//		router.match('/banner/:message', 'pages#banner');

// Routes can also specify the http method to be used to resolve a route using the via: option:
//
//		router.match('/microposts/new', 'microposts#new', { via: 'get' });
//		router.match('/microposts', 'microposts#create', { via: 'post' });