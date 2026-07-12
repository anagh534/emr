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
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Authentication routes
router.post('/register', protect, checkAnyPermission([PERMISSIONS.CREATE_DOCTOR, PERMISSIONS.CREATE_RECEPTIONIST]), validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
