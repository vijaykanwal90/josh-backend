import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    courseImageUrl: {
        type: String,

    },
    courseMentorName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true

});

export const Course = mongoose.model('Course', courseSchema);
