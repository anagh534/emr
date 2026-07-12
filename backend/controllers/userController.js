const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Get paginated list of users
 * GET /api/users?limit=5&offset=0
 */
const getUsers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '5', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const { name, email, role, isActive } = req.query;

        const query = {};

        // Name Filter (Regex match on name)
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        // Email Filter (Regex match on email)
        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }

        // Role Filter
        if (role && role !== 'All') {
            query.role = role;
        }

        // Active Status Filter
        if (isActive !== undefined && isActive !== 'All') {
            query.isActive = isActive === 'true';
        }

        // Fetch users excluding password
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);

        const totalCount = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                totalCount,
                limit,
                offset
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Toggle user active/inactive status
 * PATCH /api/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive parameter must be a boolean'
            });
        }

        // Prevent self-deactivation if user is the same
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own administrative account'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = isActive;
        await user.save();

        logger.info(`User status toggled: ${user.email} -> isActive: ${isActive} by Admin ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                id: user._id,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own administrative account'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(id);
        logger.info(`User deleted: ${user.email} by Admin ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `User ${user.name} was successfully removed`
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Change user password by Admin
 * PATCH /api/users/:id/password
 */
const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.password = password;
        await user.save();

        logger.info(`Password changed for user ${user.email} by Admin ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `Password updated successfully for ${user.name}`
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update doctor schedule config by Admin
 * PATCH /api/users/:id/schedule
 */
const updateSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { workingDays, slotDuration, sessions, breaks, department } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'Doctor') {
            return res.status(400).json({
                success: false,
                message: 'Schedules can only be configured for Doctor accounts'
            });
        }

        // Apply new values or fallback to existing values
        user.schedule = {
            department: department || user.schedule.department,
            workingDays: workingDays || user.schedule.workingDays,
            slotDuration: slotDuration || user.schedule.slotDuration,
            sessions: sessions || user.schedule.sessions,
            breaks: breaks || user.schedule.breaks
        };

        await user.save();
        logger.info(`Schedule updated for Doctor ${user.email} by Admin ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `Schedule configuration saved successfully for ${user.name}`,
            data: user.schedule
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUsers,
    toggleUserStatus,
    deleteUser,
    changePassword,
    updateSchedule
};
