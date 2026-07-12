const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: String, // User's email or name
        required: true
    },
    role: {
        type: String, // User's role
        required: true
    },
    action: {
        type: String, // E.g., 'Login', 'Appointment Created', 'Appointment Updated', 'Appointment Cancelled'
        required: true
    },
    entity: {
        type: String, // E.g., 'Appointment: ID'
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
