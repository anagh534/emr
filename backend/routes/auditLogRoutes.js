const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Mount JWT protection and restrict access exclusively to Super Admin clearance
router.use(protect);
router.use(restrictTo('Super Admin'));

router.route('/')
    .get(getAuditLogs);

module.exports = router;
