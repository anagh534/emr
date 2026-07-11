const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY;
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY;

/**
 * Generate a JWT Access Token
 * @param {Object} user - The user object
 * @returns {String} JWT token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRY }
    );
};

/**
 * Generate a JWT Refresh Token
 * @param {Object} user - The user object
 * @returns {String} JWT token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRY }
    );
};

/**
 * Verify a JWT Access Token
 * @param {String} token - The access token
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_ACCESS_SECRET);
};

/**
 * Verify a JWT Refresh Token
 * @param {String} token - The refresh token
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
