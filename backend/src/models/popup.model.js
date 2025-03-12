import mongoose from "mongoose";

const popupSchema = new mongoose.Schema({
    text:{
        type: String,
        required: true
    },
    bundle:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bundle'
    },
    isActive:{
        type: Boolean,
        default: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    
}, {
    timestamps: true
});


export const Popup = mongoose.model('Popup', popupSchema);