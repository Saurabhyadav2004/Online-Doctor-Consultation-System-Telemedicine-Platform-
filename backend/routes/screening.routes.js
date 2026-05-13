const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { create, getAll, getById, register, unregister, update, delete: del } = require('../controllers/screening.controller');

router.post('/', auth, role('admin', 'doctor'), create);
router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/:id/register', auth, register);
router.post('/:id/unregister', auth, unregister);
router.put('/:id', auth, role('admin', 'doctor'), update);
router.delete('/:id', auth, role('admin'), del);

module.exports = router;
