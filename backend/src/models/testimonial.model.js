import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    video: {
        type: String,
        default: "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-127416.jpg?ga=GA1.1.158131261.1743601196&semt=ais_hybrid&w=740"
    },
    type: {
        type: String,

        required: true
    },
    designation: {
        type: String,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    studentsImpacted:{
        type: Number,
        required: true,
        default: 1250,
    },
    teachersUsing:{
        type: Number,
        required: true,
        default: 97,

    },
    impact:{
        type: String,
        required: true,
        default:"28% higher test scores"
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
},{
    timestamps: true,
})
export const Testimonial = mongoose.model("Testimonial", testimonialSchema);