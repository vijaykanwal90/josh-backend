import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        // required: true,
        default:"pending"
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