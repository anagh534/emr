const { verifyAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');

/**
 * Protect middleware to ensure user is authenticated
 */
const protect = async (req, res, next) => {
    try {
        let token;
        
        // 1) Obtain token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // 2) Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token missing'
            });
        }
        
        try {
            // 3) Verify token
            const decoded = verifyAccessToken(token);
            
            // 4) Check if user still exists and is active
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'The user belonging to this token no longer exists'
                });
            }
            
            if (!currentUser.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account has been deactivated'
                });
            }
            
            // 5) Grant access to protected route
            req.user = currentUser;
            next();
        } catch (err) {
            // Handle specific JWT errors
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token invalid'
            });
        }
    } catch (err) {
        next(err);
    }
};

/**
 * Restrict middleware to authorize specific user roles
 * @param {...String} roles - Allowed roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user has been attached by protect middleware
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: You do not have permission to perform this action. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
