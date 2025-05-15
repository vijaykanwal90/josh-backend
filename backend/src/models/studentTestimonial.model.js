import mongoose from "mongoose";

const studentTestimonial = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default:"https://imgs.search.brave.com/7_-25qcHnU9PLXYYiiK-IwkQx93yFpp__txSD1are3s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzYz/LzM2MF9GXzY0Njc2/MzgzX0xkYm1oaU5N/NllwemIzRk00UFB1/RlA5ckhlN3JpOEp1/LmpwZw"
    },
    course: {
        type: String,
        required: true
    },
    testimonialText: {
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