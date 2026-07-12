const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all appointment endpoints
router.use(protect);

router.route('/')
    .get(getAppointments)
    .post(createAppointment);

router.route('/:id')
    .patch(updateAppointment);

module.exports = router;
