const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser, changePassword } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Lock all user management endpoints to Super Admins only
router.use(protect);
router.use(restrictTo('Super Admin'));

router.route('/')
    .get(getUsers);

router.route('/:id/status')
    .patch(toggleUserStatus);

router.route('/:id/password')
    .patch(changePassword);

router.route('/:id')
    .delete(deleteUser);

module.exports = router;
