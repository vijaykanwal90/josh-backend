import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true

    },
    bundleName: {
        type: String,
    
    },
    category:{
        type: String,
        required: true
    },
    courseMentorName: {
        type: String,
        required: true
    },
    video:{
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
