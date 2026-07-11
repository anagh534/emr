const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
    // Log the error stack for debugging
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${err.stack}`);

    // Mongoose duplicate key error (e.g. duplicate email)
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "User with this email already exists"
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({
            success: false,
            message
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

module.exports = errorMiddleware;