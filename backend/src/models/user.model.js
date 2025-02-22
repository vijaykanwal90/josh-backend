import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
        type: String,
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

export const User = mongoose.model('User', userSchema);

