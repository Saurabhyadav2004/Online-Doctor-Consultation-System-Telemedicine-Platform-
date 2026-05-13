const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { create, getAll, getById, update, delete: del } = require('../controllers/record.controller');

router.post('/', auth, create);
router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.put('/:id', auth, update);
router.delete('/:id', auth, del);

module.exports = router;
