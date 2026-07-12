const mongoose = require('mongoose');
const logger = require('../utils/logger');
const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        const superAdminExists = await User.findOne({ role: 'Super Admin' });
        if (!superAdminExists) {
            logger.info('No Super Admin found. Seeding default Super Admin...');
            
            const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@emr.com';
            const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'adminpassword123';
            const adminName = process.env.DEFAULT_ADMIN_NAME || 'System Super Admin';

            await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'Super Admin'
            });
            
            logger.info(`Default Super Admin created successfully: ${adminEmail}`);
        }
    } catch (err) {
        logger.error('Error seeding Super Admin: ' + err.message);
    }
};

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
    seedSuperAdmin();
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