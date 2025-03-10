import mongoose from 'mongoose';
const bundleSchema = new mongoose.Schema({
    bundleName: {
        type: String,
        required: true
    },
    bundleImage:{
        type: String,
        // required: true,
        bundleImage: "pending"
    },
    description: {
        type: String,
        // required: true
    },
    oldePrice:{
        type: Number,
        // required: true,
        // default: 0
    },
    price: {
        type: Number,
        // required: true
    },
    students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'  // Array of references to Course schema
    }]
});

// module.exports = mongoose.model('Bundle', bundleSchema);
export const Bundle = mongoose.model('Bundle', bundleSchema);

