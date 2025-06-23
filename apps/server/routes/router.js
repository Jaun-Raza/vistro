import express from 'express';
export const Router = express.Router();
import { forgotPass, forgotPassChallenge, logIn, signUp, verify, verifyOTP } from "../controllers/auth.js";
import {signToken, verifyToken} from '../middlewares/authMiddleware.js'
import { contactSupport, getReviews } from '../controllers/reviewsAndContact.js';
import { addBundleToProduct, addImageToProduct, getAdminProducts, getContacts, getUserStats, removeBundleToProduct, removeImageFromProduct, removeUser, addProduct, editProduct, removeProduct, toggleVisible, addReview, removeReview, getAdminReviews, getAdminOrders, getAnalytics} from '../controllers/admin.js';
import { capturePayPalOrder, checkOutWithStripe, confirmStripePayment, createPayPalOrder, getFeaturedProducts, getOrders, getProducts, getSingleProduct, handleProductDownload, placeOrder, searchProducts, verifyStripePayment } from '../controllers/product.js';

Router.route('/').get(async (req, res) => {
    return res.send("Are you lost, fella?");
});

// Website
Router.route('/auth/register').post(signUp);
Router.route('/auth/login').post(logIn);
Router.route('/auth/verify').post(verify);
Router.route('/auth/challenge-forgot-password').post(forgotPassChallenge);
Router.route('/auth/verifyOTP').post(verifyOTP);
Router.route('/auth/forgotPass').post(forgotPass);

Router.route('/reviews/get-reviews').get(getReviews)
Router.route('/reviews/contact').post(verifyToken, contactSupport)

Router.route('/products/fetch-products').post(getProducts);
Router.route('/products/fetch-featured-products').get(getFeaturedProducts);
Router.route('/products/search-product').get(searchProducts);
Router.route('/products/get-single-product').get(getSingleProduct);
Router.route('/products/checkoutWithStripe').post(checkOutWithStripe);
Router.route('/products/confirmStripePayment').post(confirmStripePayment);
Router.route('/products/verifyStripePayment').post(verifyStripePayment);
Router.route('/products/checkoutWithPayPal').post(createPayPalOrder);
Router.route('/products/capturePayPalPayment').post(capturePayPalOrder);
Router.route('/products/placeOrder').post(placeOrder);
Router.route('/products/fetch-orders').post(getOrders);
Router.route('/products/download-file').post(handleProductDownload);

// Admin
Router.route('/admin/ownerDashData').get(getAnalytics);

// User
Router.route('/admin/user/userStats').get(getUserStats);
Router.route('/admin/user/admin-remove-user').post(removeUser);

// Contact
Router.route('/admin/contacts/get-contacts').get(getContacts)

// Review
Router.route('/admin/get-admin-review-from-panel').get(getAdminReviews)
Router.route('/admin/add-review-from-panel').post(addReview)
Router.route('/admin/remove-review-from-panel').post(removeReview)

// Product
Router.route('/admin/product/get-admin-products').get(getAdminProducts)
Router.route('/admin/add-product-in-panel-vistro').post(addProduct);
Router.route('/admin/edit-product-in-panel-vistro').post(editProduct);
Router.route('/admin/remove-product-in-panel-vistro').post(removeProduct);
Router.route('/admin/add-image-to-product-from-panel').post(addImageToProduct);
Router.route('/admin/remove-image-to-product-from-panel').post(removeImageFromProduct);
Router.route('/admin/add-bundle-to-product-from-panel').post(addBundleToProduct);
Router.route('/admin/remove-bundle-to-product-from-panel').post(removeBundleToProduct);
Router.route('/admin/toggle-visibility-of-product-from-panel').post(toggleVisible);

// Order 
Router.route('/admin/orders/get-admin-orders').get(getAdminOrders);