import mongoose from "mongoose";

const popupMessageSchema = new mongoose.Schema({

    message: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});
   

export const PopupMessage = mongoose.model('PopupMessage', popupMessageSchema);
