import axios from 'axios';
import { Product } from '../models/product.js';
import Stripe from "stripe";
import { User } from '../models/user.js';
import { Order } from '../models/order.js';
import 'dotenv/config.js'
import transporter from '../middlewares/transporter.js';
import B2 from 'backblaze-b2';

function buildSortCriteria(sortBy) {
    switch (sortBy) {
        case 'lowest':
            return { 'licenses.personal': -1 };
        case 'highest':
            return { 'licenses.personal': 1 };
        case 'recentlyUpdated':
            return { updatedAt: -1 };
        case 'recentlyUploaded':
        default:
            return { createdAt: -1 };
    }
}

function buildFilterCriteria(filter, category, tags) {
    let filterCriteria = { isVisible: true };

    if (category && category !== 'All') {
        filterCriteria['productDetails.category'] = category;
    }

    if (tags && tags !== 'all') {
        filterCriteria['productDetails.tags'] = { $in: [tags] };
    }

    switch (filter) {
        case 'new':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filterCriteria.createdAt = { $gte: thirtyDaysAgo };
            break;
        case 'sale':
            filterCriteria['productDetails.caption'] = "On Sale";
            break;
        case 'featured':
            filterCriteria['productDetails.caption'] = "Featured";
            break;
        case 'all':
        default:
            break;
    }

    return filterCriteria;
}

export async function getProducts(req, res) {
    const {
        page = 1,
        limit = 8,
        sortBy = 'recentlyUploaded',
        category = 'All',
        filter = 'all',
        tags = "all"
    } = req.body;

    try {
        const sortCriteria = buildSortCriteria(sortBy);
        const filterCriteria = buildFilterCriteria(filter, category, tags);

        const products = await Product.find(filterCriteria)
            .select("productId productDetails.images productDetails.name productDetails.caption productDetails.tagline productDetails.tags licenses.personal")
            .sort(sortCriteria)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        if (!products) {
            return res.status(404).json({ error: "Products Not Found", success: false });
        }

        const fullLength = await Product.countDocuments(filterCriteria);

        const Foundtags = await Product.distinct("productDetails.tags", { isVisible: true });
        const availableFetchedtags = Foundtags.filter(tag => tag && tag.trim() !== '');

        return res.status(200).json({
            data: {
                products,
                availableFetchedtags,
                fullLength,
                currentPage: page,
                totalPages: Math.ceil(fullLength / limit)
            },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function getFeaturedProducts(req, res) {
    try {

        const products = await Product.find({ isVisible: true, "productDetails.caption": "Featured" })
            .select("productId productDetails.images productDetails.name productDetails.caption productDetails.tagline productDetails.tags licenses.personal")
            .sort({ createdAt: -1 })
            .limit(4);

        if (!products) {
            return res.status(404).json({ error: "There are not any featured products currently", success: false });
        }

        return res.status(200).json({
            data: {
                products,
            },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function searchProducts(req, res) {
    const {
        query,
        page = 1,
        limit = 10,
        sortBy = 'recentlyUploaded',
        category = 'All',
        filter = 'all',
        tags = 'all'
    } = req.query;

    try {
        const sortCriteria = buildSortCriteria(sortBy);
        let filterCriteria = buildFilterCriteria(filter, category, tags);

        filterCriteria.$or = [
            { "productDetails.name": { $regex: query, $options: "i" } },
            { "productDetails.tagline": { $regex: query, $options: "i" } },
            { "productDetails.tags": { $regex: query, $options: "i" } }
        ];

        const products = await Product.find(filterCriteria)
            .select("productId productDetails.images productDetails.name productDetails.caption productDetails.tagline productDetails.tags licenses.personal")
            .sort(sortCriteria)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        if (!products || products.length === 0) {
            return res.status(404).json({ error: "Products Not Found", success: false });
        }

        const fullLength = await Product.countDocuments(filterCriteria);

        return res.status(200).json({
            products,
            totalResults: fullLength,
            currentPage: Number(page),
            totalPages: Math.ceil(fullLength / limit),
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function getSingleProduct(req, res) {
    const { productId } = req.query;

    try {
        const product = await Product.findOne({ productId, isVisible: true });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        return res.status(200).json({ product, success: true })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

const stripe = new Stripe(process.env.SECRET_KEY);

export async function checkOutWithStripe(req, res) {
    const { products } = req.body;

    try {

        if (!products) {
            return res.status(400).json({ error: "Invalid products array", success: false });
        }

        const lineItems = products.map((product) => {
            const basePrice = product.price;
            const totalWithTax = basePrice;
            return {
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: [product.image],
                    },
                    unit_amount: Math.round(totalWithTax * 100),
                },
                quantity: 1,
            };
        });


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            allow_promotion_codes: true,
            success_url: `${process.env.SUCCESS_URL}success?payment=stripe`,
            cancel_url: `${process.env.CANCEL_URL}failure?payment=stripe`,
        });

        return res.status(200).json({ id: session.id, success: true });
    } catch (error) {
        console.error("Stripe Error:", error);
        return res.status(500).json({ error: "An error occurred while processing your payment" });
    }
}

export async function confirmStripePayment(req, res) {
    const { paymentIntentId, paymentMethodId } = req.body;

    try {
        if (!paymentIntentId) {
            return res.status(400).json({
                error: "Payment Intent ID is required",
                success: false
            });
        }

        const confirmParams = {};
        if (paymentMethodId) {
            confirmParams.payment_method = paymentMethodId;
        }

        const paymentIntent = await stripe.paymentIntents.confirm(
            paymentIntentId,
            confirmParams
        );

        if (paymentIntent.status === 'succeeded') {
            console.log("Stripe Payment Confirmed:", paymentIntent.id);

            return res.status(200).json({
                success: true,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: {
                    value: (paymentIntent.amount / 100).toFixed(2),
                    currency: paymentIntent.currency.toUpperCase()
                }
            });
        } else if (paymentIntent.status === 'requires_action') {
            return res.status(200).json({
                success: false,
                requiresAction: true,
                clientSecret: paymentIntent.client_secret
            });
        } else {
            return res.status(400).json({
                error: `Payment confirmation failed. Status: ${paymentIntent.status}`,
                success: false
            });
        }
    } catch (error) {
        console.error("Stripe Confirm Error:", error.message);
        return res.status(500).json({
            error: "An error occurred while confirming Stripe payment",
            success: false
        });
    }
}

export async function verifyStripePayment(req, res) {
    const { paymentIntentId } = req.body;

    try {
        if (!paymentIntentId) {
            return res.status(400).json({
                error: "Payment Intent ID is required",
                success: false
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            console.log("Stripe Payment Verified:", paymentIntent.id);

            return res.status(200).json({
                success: true,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: {
                    value: (paymentIntent.amount / 100).toFixed(2),
                    currency: paymentIntent.currency.toUpperCase()
                }
            });
        } else {
            return res.status(200).json({
                success: false,
                status: paymentIntent.status,
                requiresAction: paymentIntent.status === 'requires_action',
                clientSecret: paymentIntent.client_secret
            });
        }
    } catch (error) {
        console.error("Stripe Verification Error:", error.message);
        return res.status(500).json({
            error: "An error occurred while verifying Stripe payment",
            success: false
        });
    }
}

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';


async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    try {
        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting PayPal access token:', error);
        throw new Error('Failed to authenticate with PayPal');
    }
}

export async function createPayPalOrder(req, res) {
    const { products } = req.body;

    try {
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                error: "Invalid products array",
                success: false
            });
        }

        const subtotal = products.reduce(
            (sum, product) => sum + (product.price * (product.quantity || 1)),
            0
        );

        const accessToken = await getPayPalAccessToken();

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'gbp',
                        value: totalAmount.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'gbp',
                                value: subtotal.toFixed(2)
                            },
                        }
                    },
                    items: products.map(product => ({
                        name: product.name,
                        description: product.description || '',
                        unit_amount: {
                            currency_code: 'gbp',
                            value: product.price.toFixed(2)
                        },
                        quantity: (product.quantity || 1).toString()
                    }))
                }
            ],
            application_context: {
                return_url: `${process.env.SUCCESS_URL}success?payment=paypal`,
                cancel_url: `${process.env.CANCEL_URL}failure?payment=paypal`,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'Vistro'
            }
        };


        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v2/checkout/orders`,
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }
            }
        );

        const order = response.data;
        const approvalUrl = order.links.find((link) => link.rel === 'approve')?.href;

        return res.status(200).json({
            success: true,
            orderId: order.id,
            approvalUrl: approvalUrl
        });

    } catch (error) {
        console.error("PayPal Order Creation Error:", error.response?.data || error.message);
        return res.status(500).json({
            error: "An error occurred while creating PayPal order",
            success: false
        });
    }
}

export async function capturePayPalOrder(req, res) {
    const { orderId } = req.body;

    try {
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID is required",
                success: false
            });
        }

        const accessToken = await getPayPalAccessToken();

        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const captureData = response.data;

        if (captureData.status === 'COMPLETED') {
            console.log("PayPal Payment Captured:", captureData.id);

            return res.status(200).json({
                success: true,
                captureId: captureData.id,
                payerEmail: captureData.payer?.email_address,
                amount: captureData.purchase_units[0]?.payments?.captures[0]?.amount
            });
        } else {
            return res.status(400).json({
                error: "Payment capture failed",
                success: false
            });
        }

    } catch (error) {
        console.error("PayPal Capture Error:", error.response?.data || error.message);
        return res.status(500).json({
            error: "An error occurred while capturing PayPal payment",
            success: false
        });
    }
}

export async function placeOrder(req, res) {
    const { orderData } = req.body;

    try {
        const user = await User.findOne({ 'tokens.token': orderData.token });

        if (!user) {
            return res.status(401).json({ error: "UnAuthorized!", success: false })
        }

        const newOrder = new Order({
            ...orderData,
            email: user.email
        })

        user.totalPruchased = user.totalPruchased + 1;

        newOrder.save();
        user.save();
        
        const message = {
            from: "'Vistro.shop' <noreply@vistro.shop>",
            to: user.email,
            subject: 'Thanks For Ordering From Vistro.shop',
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Vistro.shop</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 32px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 1px;
        }
        .success-badge {
            background-color: #10b981;
            color: #ffffff;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
            display: inline-block;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            color: #1e293b;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 10px 0;
            text-align: center;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0 0 30px 0;
            text-align: center;
        }
        .order-info {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
        }
        .order-id {
            color: #1e40af;
            font-size: 16px;
            font-weight: 600;
        }
        .order-date {
            color: #64748b;
            font-size: 14px;
        }
        .items-section {
            margin: 30px 0;
        }
        .items-title {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 20px 0;
            text-align: center;
        }
        .item {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .item-details {
            flex: 1;
        }
        .item-name {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
        }
        .item-meta {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
        }
        .item-price {
            color: #1e40af;
            font-size: 18px;
            font-weight: 600;
        }
        .bundle-tag {
            background-color: #f0f9ff;
            color: #0369a1;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            margin: 0 4px;
        }
        .pricing-summary {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .pricing-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
        }
        .pricing-label {
            color: #64748b;
            font-size: 16px;
        }
        .pricing-value {
            color: #1e293b;
            font-size: 16px;
            font-weight: 500;
        }
        .total-row {
            border-top: 2px solid #3b82f6;
            padding-top: 15px;
            margin-top: 15px;
        }
        .total-label {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
        }
        .total-value {
            color: #1e40af;
            font-size: 20px;
            font-weight: 700;
        }
        .download-section {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border: 2px solid #22c55e;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        .download-title {
            color: #166534;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 15px 0;
        }
        .download-text {
            color: #15803d;
            font-size: 16px;
            margin: 0 0 25px 0;
        }
        .download-button {
            display: inline-block;
            background: linear-gradient(135deg, #22c55e, #16a34a);     
            padding: 15px 40px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }
        a {
            color: #ffffff;
            text-decoration: none;
        }
        .download-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        }
        .instructions {
            color: #475569;
            font-size: 15px;
            margin: 25px 0;
            text-align: left;
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .instructions-title {
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 15px 0;
        }
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #64748b;
            font-size: 14px;
            margin: 0 0 15px 0;
        }
        .contact {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        .contact:hover {
            text-decoration: underline;
        }
        .date {
            color: #94a3b8;
            font-size: 12px;
            margin: 15px 0 0 0;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #cbd5e1, transparent);
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .order-header {
                flex-direction: column;
                align-items: flex-start;
            }
            .item {
                flex-direction: column;
                align-items: flex-start;
            }
            .item-price {
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 class="logo">Vistro.shop</h1>
            <div class="success-badge">Order Confirmed</div>
        </div>

        <div class="content">
            <h2 class="title">Thank You for Your Purchase!</h2>
            <p class="subtitle">Your order has been successfully processed and is ready for download.</p>

            <div class="order-info">
                <div class="order-header">
                    <div class="order-id">Order ID: ${orderData.orderId}</div>
                    <div class="order-date">${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            </div>

            <div class="items-section">
                <h3 class="items-title">Items Purchased</h3>
                ${orderData.items.map(item => `
                    <div class="item">
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-meta">License: ${item.licenseType}</div>
                            ${item.bundles && item.bundles.length > 0 ? 
                                `<div class="item-meta">
                                    Bundles: ${item.bundles.map(bundle => `<span class="bundle-tag">${bundle}</span>`).join('')}
                                </div>` : ''
                            }
                        </div>
                        <div class="item-price">£${item.price.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="pricing-summary">
                <div class="pricing-row">
                    <span class="pricing-label">Subtotal:</span>
                    <span class="pricing-value">£${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div class="pricing-row total-row">
                    <span class="total-label">Total:</span>
                    <span class="total-value">£${orderData.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="download-section">
                <h3 class="download-title">Ready to Download!</h3>
                <p class="download-text">
                    Your digital products are now available in your account. Click below to access your purchased items.
                </p>
                <a href="${process.env.MAIN_WEB_URL}/auth/login" class="download-button">
                    Go to My Purchases
                </a>
            </div>

            <div class="instructions">
                <div class="instructions-title">How to access your downloads:</div>
                <ul>
                    <li>Click the "Go to My Purchases" button above</li>
                    <li>Log in to your Vistro.shop account</li>
                    <li>Navigate to your "Purchased" or "Downloads" page</li>
                    <li>Find your order and download your files</li>
                    <li>Keep your files safe - you can re-download them anytime</li>
                </ul>
            </div>
        </div>

        <div class="divider"></div>

        <div class="footer">
            <p class="footer-text">
                Need help? Contact our support team at 
                <a href="mailto:contact@vistro.shop" class="contact">contact@vistro.shop</a>
            </p>
           <p class="date">
                Generated on: <script>document.write(new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }));</script>
            </p>
        </div>
    </div>
</body>
</html>
            `
        };
        
        await transporter.sendMail(message);

        return res.status(200).json({ message: "Order Placed Successfully!", success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function getOrders(req, res) {
    const { token, page, limit = 10 } = req.body;

    try {
        const user = await User.findOne({ "tokens.token": token });

        if (!user) {
            return res.status(401).json({ error: "UnAuthorized!", success: false })
        }

        const orders = await Order.find({ email: user.email }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        if (!orders) {
            return res.status(404).json({ success: false, error: "You didn't ordered yet", fullLength: 0 });
        }

        const fullLength = await Order.countDocuments({});

        return res.status(200).json({
            data: {
                orders,
                fullLength
            },
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
});

async function  streamFileToClient(res, fileName, displayName) {
  const file = await b2.downloadFileByName({
    bucketName: 'vistro',
    fileName,
    responseType: 'stream',
  });

  console.log(file)

  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

  res.setHeader('Content-Disposition', `attachment; filename="${displayName}.zip"`);
  res.setHeader('Content-Type', 'application/zip');

  file.data.pipe(res);
}



export async function handleProductDownload(req, res) {
    const { orderId, itemId, bundleName = "", token } = req.body;

    try {
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ error: "Order not found!", success: false });
        }

        if (!order.status) {
            return res.status(401).json({ error: "Order isn't purchased yet", success: false });
        }

        const user = await User.findOne({ "tokens.token": token });

        if (user.email !== order.email) {
            return res.status(401).json({ error: "Un-Authorized", success: false });
        }

        const product = await Product.findOne({ productId: itemId });

        if (!product) {
            return res.status(404).json({ error: "There is no product with this ID", success: false });
        }

        await b2.authorize();

        if (bundleName !== "") {
            let bundleFile = "";
            const foundPurchasedOrder = await order.items.find((item) => {
                return item.id === itemId
            });

            if (foundPurchasedOrder.licenseType === 'personal') {
                let foundBundle = await product.bundlesPersonal.find((bundle) => {
                    return bundle.name.toLowerCase() === bundleName.toLowerCase()
                })

                if (!foundBundle) {
                    return res.status(404).json({ error: "Bundle not found", success: false });
                }

                bundleFile = foundBundle.download;
            } else {
                let foundBundle = await product.bundlesCommercial.find((bundle) => {
                    return bundle.name.toLowerCase() === bundleName.toLowerCase()
                })

                if (!foundBundle) {
                    return res.status(404).json({ error: "Bundle not found", success: false });
                }

                bundleFile = foundBundle.download;
            }
            
           await streamFileToClient(res, bundleFile, bundleName);
            
        } else {
            const productFile = product.productDetails.download;

            await streamFileToClient(res, productFile, product.productDetails.name);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}