import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: false
    },
    productDetails: {
        images: [String],
        name: {
            type: String,
            required: true
        },
        tagline: {
            type: String,
            required: true
        },
        tags: {
            type: [String],
            required: true
        },
        category: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            required: true,
            default: "Product"
        },
        download: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    },
    licenses: {
        personal: {
            type: String,
            required: true
        },
        commercial: {
            type: String,
            required: true
        },
    },
    bundlesPersonal: [Object],
    bundlesCommercial: [Object],
    isVisible: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Product = mongoose.model('Products', productSchema);