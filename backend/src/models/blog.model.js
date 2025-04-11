import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        // required: true,
        default:"https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-127416.jpg?ga=GA1.1.158131261.1743601196&semt=ais_hybrid&w=740"
    },
    category: {
        type: String,
    },
    authorName: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    content: {
        type: String,
        // required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    });
    
  
 export const Blog = mongoose.model('Blog', blogSchema);