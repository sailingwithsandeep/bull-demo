const router = require('express').Router();
const controllers = require('./lib/controllers');
const middleware = require('./lib/middleware');

router.post('/register', controllers.register);
router.post('/login/simple', controllers.simpleLogin);
router.post('/token/refresh', middleware.isAuthenticated, controllers.refreshToken);

module.exports = router;
