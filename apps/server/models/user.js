import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    totalPruchased: {
        type: Number,
        required: false,
        default: 0
    },
    discordUserId: {
        type: String,
        required: false
    },
    agreeToTerms: {
        type: Boolean,
        required: true,
        default: true,
    },
    verificationLink: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    tokens: {
        type: [Object],
        required: false,
        default: []
    },
    otp: {
        otp: Number,
        expiresAt: String
    },
    country: {
      type: String,
      required: true  
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);