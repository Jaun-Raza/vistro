import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    reviewId: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);