const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const logger = require('../utils/logger');
const { logAction } = require('../utils/auditLogger');

// Helper to get today's date in YYYY-MM-DD Swedish standard format
const getTodayString = () => {
    return new Date().toLocaleDateString('sv');
};

// Helper to convert "HH:MM AM/PM" to minutes from midnight
const timeSlotToMinutes = (timeStr) => {
    const match = timeStr.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let [_, hrs, mins, ampm] = match;
    let h = parseInt(hrs, 10);
    const m = parseInt(mins, 10);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + m;
};

// Helper to convert "HH:MM" (24h) to minutes from midnight
const time24ToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Fetch list of appointments with server-side filtering, sorting, and pagination
 * GET /api/appointments
 */
const getAppointments = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '5', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const sortBy = req.query.sortBy || 'date';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const {
            patientSearch,
            doctorSearch,
            mobileSearch,
            department,
            status,
            startDate,
            endDate
        } = req.query;

        const query = {};

        // 1) Filter by Date Range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        // 2) Filter by Department
        if (department && department !== 'All') {
            query.department = department;
        }

        // 3) Filter by Status
        if (status && status !== 'All') {
            query.status = status;
        }

        // 4) Filter by Patient Name or Patient ID
        if (patientSearch) {
            const patients = await Patient.find({
                $or: [
                    { name: { $regex: patientSearch, $options: 'i' } },
                    { patientId: { $regex: patientSearch, $options: 'i' } }
                ]
            }).select('_id');
            const patientIds = patients.map(p => p._id);
            query.patient = { $in: patientIds };
        }

        // 5) Filter by Patient Mobile Number
        if (mobileSearch) {
            const patients = await Patient.find({
                mobileNumber: { $regex: mobileSearch, $options: 'i' }
            }).select('_id');
            const patientIds = patients.map(p => p._id);
            query.patient = { $in: patientIds };
        }

        // 6) Filter by Doctor Name
        if (doctorSearch) {
            const doctors = await User.find({
                role: 'Doctor',
                name: { $regex: doctorSearch, $options: 'i' }
            }).select('_id');
            const doctorIds = doctors.map(d => d._id);
            query.doctor = { $in: doctorIds };
        }

        // Fetch appointments
        const appointments = await Appointment.find(query)
            .populate('patient')
            .populate('doctor', 'name email department')
            .sort({ [sortBy]: sortOrder, timeSlot: 1 })
            .skip(offset)
            .limit(limit);

        const totalCount = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                appointments,
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
 * Book a new appointment
 * POST /api/appointments
 */
const createAppointment = async (req, res, next) => {
    try {
        const {
            patientId,      // Provided for existing patient
            patientData,    // Provided { name, mobileNumber, age, history } for new patient
            doctorId,
            date,           // YYYY-MM-DD
            timeSlot,       // HH:MM AM/PM
            purpose,
            notes
        } = req.body;

        if (!doctorId || !date || !timeSlot || !purpose) {
            return res.status(400).json({
                success: false,
                message: 'Doctor, date, time slot, and purpose are required fields'
            });
        }

        // 1) Find/Create Patient
        let patientObj;
        if (patientId) {
            patientObj = await Patient.findOne({ patientId });
            if (!patientObj) {
                return res.status(404).json({
                    success: false,
                    message: `Existing patient with ID ${patientId} not found`
                });
            }
        } else if (patientData) {
            const { name, mobileNumber, age, history } = patientData;
            if (!name || !mobileNumber || !age) {
                return res.status(400).json({
                    success: false,
                    message: 'New patient registration requires name, mobile number, and age'
                });
            }

            // Check if patient already exists by phone
            patientObj = await Patient.findOne({ mobileNumber });
            if (!patientObj) {
                patientObj = new Patient({ name, mobileNumber, age, history });
                await patientObj.save();
                logger.info(`Auto-created Patient record for appointment: ${patientObj.patientId}`);
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Must provide either patientId (existing) or patientData (new)'
            });
        }

        // 2) Verify Doctor and Department
        const doctorObj = await User.findById(doctorId);
        if (!doctorObj || doctorObj.role !== 'Doctor') {
            return res.status(400).json({
                success: false,
                message: 'Selected consulting doctor does not exist'
            });
        }
        const department = doctorObj.schedule?.department || 'General Medicine';

        // 3) Validate against Past Date
        const todayStr = getTodayString();
        if (date < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Cannot schedule appointments for past dates'
            });
        }

        // 4) Validate against Past Time Slot if today
        if (date === todayStr) {
            const now = new Date();
            const currentMin = now.getHours() * 60 + now.getMinutes();
            const slotMin = timeSlotToMinutes(timeSlot);
            if (slotMin <= currentMin) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot schedule appointments for past time slots today'
                });
            }
        }

        // 5) Validate against Doctor Breaks
        if (doctorObj.schedule && doctorObj.schedule.breaks) {
            const slotMin = timeSlotToMinutes(timeSlot);
            const slotDuration = doctorObj.schedule.slotDuration || 15;
            const slotEndMin = slotMin + slotDuration;

            const isDuringBreak = doctorObj.schedule.breaks.some(brk => {
                const breakStart = time24ToMinutes(brk.startTime);
                const breakEnd = time24ToMinutes(brk.endTime);
                // Check overlap
                return (slotMin >= breakStart && slotMin < breakEnd) ||
                    (slotEndMin > breakStart && slotEndMin <= breakEnd) ||
                    (slotMin <= breakStart && slotEndMin >= breakEnd);
            });

            if (isDuringBreak) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected slot falls inside the doctor\'s scheduled break period'
                });
            }
        }

        // 6) Save Appointment and catch Double Bookings
        const appointment = new Appointment({
            patient: patientObj._id,
            doctor: doctorObj._id,
            department: doctorObj.schedule?.department || 'General Medicine', // Sync from doctor profile
            date,
            timeSlot,
            purpose,
            notes
        });

        try {
            await appointment.save();
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Double Booking Blocked: This slot has already been booked by another user. Please choose another time.'
                });
            }
            throw err;
        }

        logger.info(`Appointment booked successfully: Patient ${patientObj.patientId} with Doctor ${doctorObj.name} at ${timeSlot} on ${date}`);
        await logAction(req.user.email, req.user.role, 'Appointment Created', `Appointment: ${appointment._id}`);

        // Return populated appointment
        const populated = await Appointment.findById(appointment._id)
            .populate('patient')
            .populate('doctor', 'name email department');

        const io = req.app.get('io');
        if (io) {
            io.emit('appointment:created', populated);
        }

        res.status(201).json({
            success: true,
            data: populated
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update appointment details and manage status workflows
 * PATCH /api/appointments/:id
 */
const updateAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { purpose, notes, status } = req.body;

        const appointment = await Appointment.findById(id).populate('doctor', 'name');
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Enforce Workflow Transitions:
        // Scheduled -> Arrived -> Completed
        // Cancelled and Completed are terminal
        // Enforce Workflow Transitions:
        // Scheduled -> Arrived -> Completed
        // Cancelled and Completed are terminal
        let targetStatus = status;
        if (notes && notes.trim() !== '' && appointment.status !== 'Completed' && appointment.status !== 'Cancelled') {
            targetStatus = 'Completed';
        }

        if (targetStatus) {
            const current = appointment.status;

            if (current === 'Completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update status on a completed appointment'
                });
            }

            if (current === 'Cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update status on a cancelled appointment'
                });
            }

            // Only enforce Arrived -> Completed requirement if it is a manual status change (not triggered by notes)
            const isAutoCompletedByNotes = notes && notes.trim() !== '' && targetStatus === 'Completed';
            if (targetStatus === 'Completed' && current !== 'Arrived' && !isAutoCompletedByNotes) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient must be marked as Arrived before marking appointment as Completed'
                });
            }

            appointment.status = targetStatus;
            if (targetStatus === 'Cancelled') {
                appointment.isCancelled = true;
            }
        }

        if (purpose) appointment.purpose = purpose;
        if (notes !== undefined) appointment.notes = notes;

        await appointment.save();
        logger.info(`Appointment ${id} updated: Status: ${appointment.status}`);
        await logAction(req.user.email, req.user.role, appointment.status === 'Cancelled' ? 'Appointment Cancelled' : 'Appointment Updated', `Appointment: ${appointment._id}`);

        const populated = await Appointment.findById(appointment._id)
            .populate('patient')
            .populate('doctor', 'name email department');

        const io = req.app.get('io');
        if (io) {
            if (populated.status === 'Cancelled') {
                io.emit('appointment:cancelled', populated);
            }
            io.emit('appointment:updated', populated);
        }

        res.status(200).json({
            success: true,
            data: populated
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAppointments,
    createAppointment,
    updateAppointment
};
