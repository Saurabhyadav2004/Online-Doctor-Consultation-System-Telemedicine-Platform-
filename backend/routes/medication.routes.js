const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { create, getAll, update, delete: del } = require('../controllers/medication.controller');

router.post('/', auth, create);
router.get('/', auth, getAll);
router.put('/:id', auth, update);
router.delete('/:id', auth, del);

module.exports = router;
