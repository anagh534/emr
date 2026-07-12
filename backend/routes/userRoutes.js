const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser, changePassword, updateSchedule } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateChangePassword, validateToggleStatus, validateSchedule } = require('../validators/userValidator');

// Lock all user management endpoints to Super Admins only
router.use(protect);
router.use(restrictTo('Super Admin'));

router.route('/')
    .get(getUsers);

router.route('/:id/status')
    .patch(validateToggleStatus, toggleUserStatus);

router.route('/:id/password')
    .patch(validateChangePassword, changePassword);

router.route('/:id/schedule')
    .patch(validateSchedule, updateSchedule);

router.route('/:id')
    .delete(deleteUser);

module.exports = router;
