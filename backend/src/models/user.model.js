import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { asynchHandler } from '../utils/AsynchHandler.js';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
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
        required: true,
        select:false
    },
    role: {
        type: String,
        default: 'user'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    mobilenumber: {
        type: Number,
        required: true
    },
    // this is referral code entered by the user
    referralcode: {
        type: String
    },
    // one for each user to share

    sharableReferralCode: {
        type: String
    },


}, {
    timestamps: true
})
userSchema.methods.verifyPassword = async function (passwordByUser) {
    const user = this;
    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(passwordByUser, hashedPassword);
    return isValid;
    
}
userSchema.methods.getJWT = (async function () {
    const user = this;
    const token = await jwt.sign({id: user._id},"JoshGuruPvt@2025");
    return token;
})

export const User = mongoose.model('User', userSchema);

