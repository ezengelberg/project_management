const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isStudent: { // This is a boolean field that will be used to determine if the user is a student
        type: Boolean,
        default: true
    },
    isAdvisor: { // This is a boolean field that will be used to determine if the user is an advisor
        type: Boolean,
        default: false
    },
    isSuperAdmin: { // This is a boolean field that will be used to determine if the user is a super admin
        type: Boolean,
        default: false
    },
    projectYear : {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);
