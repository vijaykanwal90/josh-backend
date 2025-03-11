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
    price: {
        type: Number,
        // required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    discountedPrice: {
        type: Number,
    },

    hasDiscount: {
        type: Boolean,
        default: false
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

