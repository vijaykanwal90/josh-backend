import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        category: {
            enum: ["Events", "Trips", "Ocassions"],
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

export const Gallery = mongoose.model("Gallery", gallerySchema);