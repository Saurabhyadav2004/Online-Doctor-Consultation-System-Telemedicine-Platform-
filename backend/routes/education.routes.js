const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { create, getAll, getById, toggleLike, addComment, deleteComment, update, delete: del } = require('../controllers/education.controller');

router.post('/', auth, role('admin', 'doctor'), create);
router.get('/', auth, getAll);
router.get('/:id', auth, getById);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, addComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);
router.put('/:id', auth, role('admin', 'doctor'), update);
router.delete('/:id', auth, role('admin'), del);

module.exports = router;
