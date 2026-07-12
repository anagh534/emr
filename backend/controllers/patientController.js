const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger');

/**
 * Search patients by Name, Patient ID, or Mobile number and attach booking history details
 * GET /api/patients?query=...
 */
const searchPatients = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '5', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const { query } = req.query;
        const filter = {};

        if (query && query.trim() !== '') {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { patientId: { $regex: query, $options: 'i' } },
                { mobileNumber: { $regex: query, $options: 'i' } }
            ];
        }

        const totalCount = await Patient.countDocuments(filter);
        const patients = await Patient.find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
        
        // Fetch scheduled appointments for these patients to return booking details
        const patientIds = patients.map(p => p._id);
        const appointments = await Appointment.find({ patient: { $in: patientIds } })
            .populate('doctor', 'name')
            .sort({ date: -1, timeSlot: -1 });

        // Map appointments as bookings list per patient profile
        const patientsWithBookings = patients.map(p => {
            const bookings = appointments.filter(a => a.patient.toString() === p._id.toString());
            return {
                ...p.toObject(),
                bookings: bookings.map(b => ({
                    _id: b._id,
                    doctorName: b.doctor?.name || 'Unknown Doctor',
                    date: b.date,
                    timeSlot: b.timeSlot,
                    status: b.status,
                    purpose: b.purpose
                }))
            };
        });

        res.status(200).json({
            success: true,
            data: {
                patients: patientsWithBookings,
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
