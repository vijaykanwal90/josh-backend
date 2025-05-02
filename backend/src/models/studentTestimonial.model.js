import mongoose from "mongoose";

const studentTestimonial = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-127416.jpg?ga=GA1.1.158131261.1743601196&semt=ais_hybrid&w=740"
    },
    designation: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isVideo:{
        type: Boolean,
        default: false
    },
    videoUrl:{
        type: String,
        default: "https://www.youtube.com/embed/9WBanQptJDc"

    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
}, {
    timestamps: true,
})
export const StudentTestimonial = mongoose.model("StudentTestimonial", studentTestimonial);