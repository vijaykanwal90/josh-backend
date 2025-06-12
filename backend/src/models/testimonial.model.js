import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    video: {
        type: String,
        // default: "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-127416.jpg?ga=GA1.1.158131261.1743601196&semt=ais_hybrid&w=740"
    },
    thumbnail:{
        type: String,
        default: "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-127416.jpg?ga=GA1.1.158131261.1743601196&semt=ais_hybrid&w=740" ,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    studentsImpacted:{
        type: Number,
        required: true,
    },
    teachersUsing:{
        type: Number,
        required: true,
    },
    improvementMetric:{
        type: String,
        required: true,
    },
    quote: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    representative: {
        type:String,
        required: true,
    },
    representativeImage: {
        type:String,
        default: "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-127416.jpg?ga=GA1.1.158131261.1743601196&semt=ais_hybrid&w=740"
    },
},{
    timestamps: true,
})
export const Testimonial = mongoose.model("Testimonial", testimonialSchema);