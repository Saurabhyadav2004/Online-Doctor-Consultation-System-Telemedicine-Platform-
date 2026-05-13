const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { create, getAll, getLatest, delete: del } = require('../controllers/vital.controller');

router.post('/', auth, create);
router.get('/', auth, getAll);
router.get('/latest', auth, getLatest);
router.delete('/:id', auth, del);

module.exports = router;
