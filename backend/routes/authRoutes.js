const express = require('express');
const router = express.Router();
const {
    register,
    login,
    refresh,
    logout,
    getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { checkAnyPermission, PERMISSIONS } = require('../middleware/rbacMiddleware');

// Authentication routes
router.post('/register', protect, checkAnyPermission([PERMISSIONS.CREATE_DOCTOR, PERMISSIONS.CREATE_RECEPTIONIST]), register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
