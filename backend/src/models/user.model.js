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
        select: false
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
    bundles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle'
    }],
    mobilenumber: {
        type: String,
        required: true
    },
    // this is referral code entered by the user
   
    // one for each user to share

    sharableReferralCode: {
        type: String,
        unique: true,
    },
    referredByCode: {
        type: String,
    },
    total_income: {
        type: Number, default: 0
    },
    incomeHistory:[
        {
            amount:{
                type: Number,
                
            },
            date:{
                type: Date,
                default: Date.now
            },
            from:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    myTeam: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    totalTeam: {
        type: Number,
        default: 0
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
userSchema.methods.getJWT =  function () {
    const user = this;
    const token =  jwt.sign({ id: user._id }, "JoshGuruPvt@2025");
    return token;
}

export const User = mongoose.model('User', userSchema);

