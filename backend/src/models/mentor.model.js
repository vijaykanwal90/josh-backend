import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { asynchHandler } from '../utils/AsynchHandler.js';
import jwt from 'jsonwebtoken';
const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true
    },
    password: {
        type: String,
        // required: true,
        select: false
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