const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { create, getAll, getById, update, cancel } = require('../controllers/appointment.controller');

router.post('/', auth, create);
router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.put('/:id', auth, update);
router.patch('/:id/cancel', auth, cancel);

module.exports = router;
