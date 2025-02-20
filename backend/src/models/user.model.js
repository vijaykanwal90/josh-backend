import mongoose from 'mongoose';

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
    referralcode: {
        type: String
    }

}, {
    timestamps: true
})

export const User = mongoose.model('User', userSchema);

