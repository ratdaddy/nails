/**
 * Application routes
 */

router.match('/home', 'pages#home');
router.match('/alt/home', 'pages#altHome');
router.match('/alt/async/home', 'pages#altAsyncHome');
router.match('/async/home', 'pages#asyncHome');
router.match('/about', 'pages#about');
router.match('/banner/:message', 'pages#banner');

router.match('/microposts/new', 'microposts#new', { via: 'get' });
router.match('/microposts', 'microposts#create', { via: 'post' });

router.match('/tests/redirect', 'tests#redirect');
