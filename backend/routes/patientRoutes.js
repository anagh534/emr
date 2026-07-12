const express = require('express');
const router = express.Router();
const { searchPatients, createPatient } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// Protect all patient endpoints
router.use(protect);

router.route('/')
    .get(searchPatients)
    .post(createPatient);

module.exports = router;
