const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getAll, getById, updateProfile, getDoctors, deleteUser } = require('../controllers/user.controller');

router.get('/', auth, role('admin'), getAll);
router.get('/doctors', auth, getDoctors);
router.get('/:id', auth, getById);
router.put('/:id', auth, updateProfile);
router.put('/me', auth, updateProfile);
router.delete('/:id', auth, role('admin'), deleteUser);

module.exports = router;
