const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, refresh, me, logout } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', auth, me);
router.post('/logout', auth, logout);

module.exports = router;
