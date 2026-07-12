const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

/**
 * Persist an event to the audit trail collection
 * @param {string} user - User's email or name
 * @param {string} role - User's clearance role
 * @param {string} action - Action identifier (e.g. 'Login', 'Appointment Created')
 * @param {string} entity - Entity detail (e.g. 'Appointment: 12345')
 */
const logAction = async (user, role, action, entity) => {
    try {
        await AuditLog.create({
            user,
            role,
            action,
            entity
        });
        logger.info(`[AUDIT] [${role}] ${user} performed ${action} on ${entity}`);
    } catch (err) {
        logger.error(`Failed to write to audit log: ${err.message}`);
    }
};

module.exports = { logAction };
