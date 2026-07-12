const Patient = require('../models/Patient');
const logger = require('../utils/logger');

/**
 * Search patients by Name, Patient ID, or Mobile number
 * GET /api/patients?query=...
 */
const searchPatients = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(200).json({ success: true, data: [] });
        }

        const filter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { patientId: { $regex: query, $options: 'i' } },
                { mobileNumber: { $regex: query, $options: 'i' } }
            ]
        };

        const patients = await Patient.find(filter).limit(10);
        res.status(200).json({
            success: true,
            data: patients
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create a new patient
 * POST /api/patients
 */
const createPatient = async (req, res, next) => {
    try {
        const { name, mobileNumber, age, history } = req.body;

        if (!name || !mobileNumber || !age) {
            return res.status(400).json({
                success: false,
                message: 'Name, mobile number, and age are required'
            });
        }

        // Check if mobile number already exists
        const existing = await Patient.findOne({ mobileNumber });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Patient with this mobile number is already registered'
            });
        }

        const patient = new Patient({ name, mobileNumber, age, history });
        await patient.save();

        logger.info(`Patient record created: ${patient.patientId} - ${patient.name}`);

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    searchPatients,
    createPatient
};
