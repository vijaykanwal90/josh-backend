import {mongoose, Schema} from "mongoose";

const webinarSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true, 'Time is required']
    },
    duration: {
        type: String,
        required: [true, 'Duration is required']
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail is required']
    },
    presenterName: {
        type: String,
        required: [true, 'Speaker is required']
    },
    presenterRole: {
        type: String,
        required: [true, 'Role is required']
    },
    presenterImage: {
        type: String,
        required: [true, 'Presenter image is required']
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'], // Fix typo
        default: 'scheduled',
    },
    webinarUsers: [
        {
            name: {
                type: String,
                required: [true, 'User name is required']
            },
            email: {
                type: String,
                required: [true, 'User email is required']
            },
            mobile: {
                type: String,
                required: [true, 'User mobile number is required']
            },
            registeredAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });

const Webinar = mongoose.model('Webinar', webinarSchema);
export default Webinar;