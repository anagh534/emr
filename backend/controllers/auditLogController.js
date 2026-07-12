const AuditLog = require('../models/AuditLog');

/**
 * Fetch system audit logs (Super Admin restricted)
 * GET /api/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);

        const totalCount = await AuditLog.countDocuments({});
        const logs = await AuditLog.find({})
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: {
                logs,
                totalCount,
                limit,
                offset
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAuditLogs };
