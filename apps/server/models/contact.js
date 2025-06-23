import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    contactId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contactReason: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Contact = mongoose.model('Contact', contactSchema);