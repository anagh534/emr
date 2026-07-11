const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4, // Use IPv4, if you have issues with IPv6 connectivity
            maxPoolSize: 50, // Increase the maximum pool size for better performance under load
            minPoolSize: 5, // Set a minimum pool size to keep connections alive
            autoIndex: false, // Disable auto-indexing for better performance in production
            retryWrites: true, // Enable retryable writes for better reliability
        });
    } catch (err) {
        logger.error('MongoDB connection failed: ' + err.message);
        // Don't exit - allow the app to start and retry
        setTimeout(connectDB, 5000); // Retry after 5 seconds
    }
};

mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
    logger.info('MongoDB disconnected - auto reconnecting...');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error: ' + err.message);
});

module.exports = connectDB;