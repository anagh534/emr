const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required']
    },
    history: {
        type: String,
        default: '',
        trim: true
    }
}, {
    timestamps: true
});

// Index on patient name to optimize searches
patientSchema.index({ name: 1 });

// Auto-generate patientId before save
patientSchema.pre('save', async function() {
    if (!this.patientId) {
        const rand = Math.floor(100000 + Math.random() * 900000);
        this.patientId = `PAT-${rand}`;
    }
});

module.exports = mongoose.model('Patient', patientSchema);
