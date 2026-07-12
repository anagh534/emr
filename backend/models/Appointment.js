const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient link is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor link is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        type: String, // format HH:MM AM/PM
        required: [true, 'Time slot is required']
    },
    purpose: {
        type: String,
        required: [true, 'Appointment purpose is required'],
        trim: true
    },
    notes: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['Scheduled', 'Arrived', 'Completed', 'Cancelled'],
            message: '{VALUE} is not a valid appointment status'
        },
        default: 'Scheduled'
    },
    isCancelled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound unique index to guarantee no double booking for same doctor at same date and time slot (excluding Cancelled ones)
appointmentSchema.index(
    { doctor: 1, date: 1, timeSlot: 1 }, 
    { 
        unique: true,
        partialFilterExpression: { isCancelled: false }
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
