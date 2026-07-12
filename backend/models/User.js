const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['Super Admin', 'Receptionist', 'Doctor'],
            message: '{VALUE} is not a valid role'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    schedule: {
        department: {
            type: String,
            default: 'Diagnostic Medicine'
        },
        workingDays: {
            type: [String],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        slotDuration: {
            type: Number,
            default: 15 // in minutes
        },
        sessions: {
            type: [{
                name: String,
                startTime: String, // HH:MM (24h)
                endTime: String    // HH:MM (24h)
            }],
            default: [
                { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
                { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
            ]
        },
        breaks: {
            type: [{
                name: String,
                startTime: String, // HH:MM (24h)
                endTime: String    // HH:MM (24h)
            }],
            default: [
                { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
            ]
        }
    }
}, {
    timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    // Since password field might be excluded, we need to handle case where it's not present
    if (!this.password) {
        throw new Error('Password field not selected');
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
