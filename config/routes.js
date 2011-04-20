/**
 * Application routes
 */

router.match('/home', 'pages#home');
router.match('/about', 'pages#about');
router.match('/banner/:message', 'pages#banner');