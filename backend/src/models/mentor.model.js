import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true
    },
    position:{
        type: String,
        // required: true
    },
    profileImage: {
        type: String,
        default: "pending"
    },
    about: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: 'user'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    mobileNumber: {
        type: String,
        required: true
    },
    socialLinks: [{
        link: String,
        name: String
    }],

}, {
    timestamps: true
})
export const Mentor = mongoose.model('Mentor', mentorSchema);