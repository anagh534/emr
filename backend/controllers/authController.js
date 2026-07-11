const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('../utils/jwtUtils');
const logger = require('../utils/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Simple validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, email, password, role)'
            });
        }

        // Validate role
        const validRoles = ['Super Admin', 'Receptionist', 'Doctor'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles are: ${validRoles.join(', ')}`
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to database
        const expiryDays = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS || '7', 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt
        });

        logger.info(`User registered successfully: ${user.email} (${user.role})`);

        // Respond with tokens and user info (excluding password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and explicitly select password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administration.'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to database
        const expiryDays = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS || '7', 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt
        });

        logger.info(`User logged in: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Refresh access token using a refresh token
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // 1) Verify refresh token signature and expiry
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            // Delete token from DB if invalid/expired to keep DB clean (optional)
            await RefreshToken.deleteOne({ token: refreshToken });
            return res.status(401).json({
                success: false,
                message: 'Refresh token is invalid or expired'
            });
        }

        // 2) Check if token exists in database (logout/invalidation check)
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token has been revoked or is invalid'
            });
        }

        // 3) Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        // 4) Generate new access token
        const newAccessToken = generateAccessToken(user);

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Logout and invalidate refresh token
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required to logout'
            });
        }

        // Invalidate token by removing it from the database
        const result = await RefreshToken.deleteOne({ token: refreshToken });

        if (result.deletedCount === 0) {
            logger.warn(`Logout attempted with invalid or already revoked refresh token`);
        } else {
            logger.info(`Refresh token invalidated successfully during logout`);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully, refresh token invalidated'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout
};
