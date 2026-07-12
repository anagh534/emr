const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser, changePassword, updateSchedule } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateChangePassword, validateToggleStatus, validateSchedule } = require('../validators/userValidator');

// Lock all user endpoints to authenticated users
router.use(protect);

router.route('/')
    .get(restrictTo('Super Admin', 'Receptionist'), getUsers);

// Restrict administrative modifications to Super Admins only
router.use(restrictTo('Super Admin'));

router.route('/:id/status')
    .patch(validateToggleStatus, toggleUserStatus);

router.route('/:id/password')
    .patch(validateChangePassword, changePassword);

router.route('/:id/schedule')
    .patch(validateSchedule, updateSchedule);

router.route('/:id')
    .delete(deleteUser);

module.exports = router;
