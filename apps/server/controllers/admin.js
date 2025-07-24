import { Contact } from '../models/contact.js';
import { Order } from '../models/order.js';
import { Product } from '../models/product.js';
import { Review } from '../models/review.js';
import { User } from '../models/user.js';
import "dotenv/config.js";

export async function getAdminReviews(req, res) {
    const { page, limit = 10 } = req.query;

    try {
        const reviews = await Review.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        if (reviews.length === 0) {
            return res.status(404).json({ error: "No Reviews Found", success: false });
        }

        const fullLength = await Review.countDocuments({});

        return res.status(200).json({
            data: {
                reviews,
                fullLength
            },
            success: false
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function addReview(req, res) {
    const { customerName, rating, reviewText } = req.body;

    try {
        const newReview = new Review({
            reviewId: `review_${Math.floor(Math.random() * 9999)}`,
            author: customerName,
            rating,
            review: reviewText
        });

        newReview.save();
        return res.status(200).json({ message: "Review Added Successfully!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function removeReview(req, res) {
    const { reviewId } = req.body;

    try {
        await Review.deleteOne({ reviewId });

        return res.status(200).json({ message: "Review Removed Successfully!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function getUserStats(req, res) {
    const { page, limit = 10 } = req.query;

    try {
        const users = await User.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        if (users.length === 0) {
            return res.status(404).json({ error: "No Users Found", success: false });
        }

        const fullLength = await User.countDocuments({});

        return res.status(200).json({
            data: {
                users,
                fullLength
            },
            success: false
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function removeUser(req, res) {
    const { email } = req.body;

    try {
        await User.deleteOne({ email });
        return res.status(200).json({ message: "Successfully Removed!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function getContacts(req, res) {
    const { page, limit = 10 } = req.query;

    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        if (contacts.length === 0) {
            return res.status(404).json({ error: "No Submissions Found", success: false });
        }

        const fullLength = await Contact.countDocuments({});

        return res.status(200).json({
            data: {
                contacts,
                fullLength
            },
            success: false
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function toggleVisible(req, res) {
    const { productId } = req.body;

    try {
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        product.isVisible = !product.isVisible;
        product.save();

        return res.status(200).json({ message: `It's ${product.isVisible ? 'Visible' : 'Invisible'} now.`, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function addProduct(req, res) {
    const {
        name,
        tagline,
        description,
        licenses,
        tags,
        download,
        category,
        caption,
        images,
        bundlesPersonal,
        bundlesCommerical
    } = req.body;

    try {
        let randomId = Math.floor(Math.random() * 9999);

        const newProduct = new Product({
            productId: `product_${randomId}`,
            productDetails: {
                images,
                name,
                tagline,
                tags,
                category,
                caption,
                download,
                description
            },
            licenses,
            bundlesPersonal,
            bundlesCommerical
        })

        await newProduct.save();
        return res.status(200).json({ message: "Product Saved Successfully!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function editProduct(req, res) {
    const { editProduct } = req.body;

    try {
        const product = await Product.findOne({ productId: editProduct.id });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        await Product.updateOne(
            { productId: editProduct.id },
            {
                $set: {
                    [`productDetails.name`]: editProduct.name,
                    [`productDetails.tagline`]: editProduct.tagline,
                    [`productDetails.description`]: editProduct.description,
                    [`productDetails.download`]: editProduct.download,
                    [`productDetails.tags`]: editProduct.tags,
                    [`productDetails.category`]: editProduct.category,
                    [`productDetails.caption`]: editProduct.caption,
                    [`licenses.personal`]: editProduct.licenses.personal,
                    [`licenses.commercial`]: editProduct.licenses.commercial
                }
            },
            { new: true }
        );

        return res.status(200).json({ message: "Product Edit Successfully!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function removeProduct(req, res) {
    const { productId } = req.body;

    try {
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        await Product.deleteOne({ productId });

        return res.status(200).json({ message: "Product Deleted Successfully!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function getAdminProducts(req, res) {
    const { page, limit = 5 } = req.query;

    try {
        const products = await Product.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        if (products.length === 0) {
            return res.status(404).json({ error: "No Submissions Found", success: false });
        }

        const fullLength = await Product.countDocuments({});

        return res.status(200).json({
            data: {
                products,
                fullLength
            },
            success: false
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function addImageToProduct(req, res) {
    const { productId, imageUrl } = req.body;

    try {
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        let productImagesArray = [...product.productDetails.images, imageUrl];
        product.productDetails.images = productImagesArray;
        await product.save();

        return res.status(200).json({ message: "Image is uploaded successfully!", success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function removeImageFromProduct(req, res) {
    const { productId, imageIndex } = req.body;

    try {
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        const updatedImages = await product.productDetails.images.filter((_, index) => index !== imageIndex);
        product.productDetails.images = updatedImages;

        product.save();
        return res.status(200).json({ message: "Successfully Removed!", success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function addBundleToProduct(req, res) {
    const { productId, bundleToAdd } = req.body;

    try {
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        var updatedBundlesArray = [];

        if (bundleToAdd.type === 'personal') {
            updatedBundlesArray = [...product.bundlesPersonal, bundleToAdd];
            product.bundlesPersonal = updatedBundlesArray;
        } else {
            updatedBundlesArray = [...product.bundlesCommercial, bundleToAdd];
            product.bundlesCommercial = updatedBundlesArray;
        }

        product.save();
        return res.status(200).json({ message: "Successfully Added bundle to the product", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function removeBundleToProduct(req, res) {
    const { productId, bundleId, bundleType } = req.body;

    try {
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ error: "Product Not Found", success: false });
        }

        var updatedBundlesArray = [];

        if (bundleType === 'personal') {
            const isBundleExist = await product.bundlesPersonal.filter((bundle) => {
                return bundle.id === bundleId
            })

            if (!isBundleExist) {
                return res.status(404).json({ error: "Bundle Not Found", success: false });
            }

            updatedBundlesArray = await product.bundlesPersonal.filter((bundle) => {
                return bundle.id !== isBundleExist[0].id
            });

            product.bundlesPersonal = updatedBundlesArray;
        } else {
            const isBundleExist = await product.bundlesCommercial.filter((bundle) => {
                return bundle.id === bundleId
            })

            if (!isBundleExist) {
                return res.status(404).json({ error: "Bundle Not Found", success: false });
            }

            updatedBundlesArray = await product.bundlesCommercial.filter((bundle) => {
                return bundle.id !== isBundleExist[0].id
            });

            product.bundlesCommercial = updatedBundlesArray;
        }

        product.save();
        return res.status(200).json({ message: "Successfully Removed!", success: true })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function getAdminOrders(req, res) {
    const { page, limit = 10 } = req.query;

    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        if (!orders) {
            return res.status(404).json({ success: false, error: "Orders Not Found" });
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

export async function getAnalytics(req, res) {
    try {
        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        const totalUsers = await User.countDocuments({});
        const userWithPurchases = await User.countDocuments({ totalPurchased: { $gt: 0 } });
        const mostPurchasedProduct = (await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]))[0]?._id || ''
        const userIsVerified = await User.countDocuments({ isVerified: true });
        const totalReviews = await Review.countDocuments({});
        const totalProductsUploaded = await Product.countDocuments({});
        const totalOrders = await Order.countDocuments({});
        const revenues = await Order.find({ status: "completed" }).select("total");
        const totalRevenue = revenues.reduce((sum, product) => sum + product.total, 0);
        const totalStripeOrders = await Order.countDocuments({ paymentMethod: "stripe" });
        const totalPayPalOrders = await Order.countDocuments({ paymentMethod: "paypal" });
        const totalContactSubmissions = await Contact.countDocuments({});
        const topContactReason = await Contact.aggregate([
            {
                $match: {
                    contactReason: {
                        $in: ["product-support", "legal-inquiry", "general-inquiry", "other"]
                    }
                }
            },
            { $group: { _id: "$contactReason", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostContactReasonSubmission = topContactReason[0]?._id || '';

        const currentTotalAnalytics = {
            userWithPurchases,
            userWithoutPurchases: totalUsers - userWithPurchases,
            userIsVerified,
            totalUsers,
            totalReviews,
            totalProductsUploaded,
            mostPurchasedProduct,
            totalOrders,
            totalRevenue,
            totalStripeOrders,
            totalPayPalOrders,
            totalContactSubmissions,
            mostContactReasonSubmission
        };

        const lastMonthAnalytics = {
            totalUsers: await User.countDocuments({ createdAt: { $gte: lastMonthStart } }),
            totalReviews: await Review.countDocuments({ createdAt: { $gte: lastMonthStart } }),
            totalProductsUploaded: await Product.countDocuments({ createdAt: { $gte: lastMonthStart } }),
            totalOrders: await Order.countDocuments({ createdAt: { $gte: lastMonthStart } }),
            totalRevenue: (
                await Order.find({ status: "completed", createdAt: { $gte: lastMonthStart } }).select("total")
            ).reduce((sum, product) => sum + product.total, 0),
            totalStripeOrders: await Order.countDocuments({ paymentMethod: "stripe", createdAt: { $gte: lastMonthStart } }),
            totalPayPalOrders: await Order.countDocuments({ paymentMethod: "paypal", createdAt: { $gte: lastMonthStart } }),
            mostPurchasedProduct: (await Order.aggregate([
                { $unwind: "$items" },
                { $match: { createdAt: { $gte: lastMonthStart } } },
                {
                    $group: {
                        _id: "$items.name",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]))[0]?._id || '',
            totalContactSubmissions: await Contact.countDocuments({ createdAt: { $gte: lastMonthStart } }),
            mostContactReasonSubmission: (
                await Contact.aggregate([
                    { $match: { createdAt: { $gte: lastMonthStart }, contactReason: { $in: ["product-support", "legal-inquiry", "general-inquiry", "other"] } } },
                    { $group: { _id: "$contactReason", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 1 }
                ])
            )[0]?._id || ''
        };

        const lastYearAnalytics = {
            totalUsers: await User.countDocuments({ createdAt: { $gte: lastYearStart } }),
            totalReviews: await Review.countDocuments({ createdAt: { $gte: lastYearStart } }),
            totalProductsUploaded: await Product.countDocuments({ createdAt: { $gte: lastYearStart } }),
            totalOrders: await Order.countDocuments({ createdAt: { $gte: lastYearStart } }),
            totalRevenue: (
                await Order.find({ status: "completed", createdAt: { $gte: lastYearStart } }).select("total")
            ).reduce((sum, product) => sum + product.total, 0),
            totalStripeOrders: await Order.countDocuments({ paymentMethod: "stripe", createdAt: { $gte: lastYearStart } }),
            totalPayPalOrders: await Order.countDocuments({ paymentMethod: "paypal", createdAt: { $gte: lastYearStart } }),
            totalContactSubmissions: await Contact.countDocuments({ createdAt: { $gte: lastYearStart } }),
            mostPurchasedProduct: (await Order.aggregate([
                { $unwind: "$items" },
                { $match: { createdAt: { $gte: lastYearStart } } },
                {
                    $group: {
                        _id: "$items.name",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]))[0]?._id || '',
            mostContactReasonSubmission: (
                await Contact.aggregate([
                    { $match: { createdAt: { $gte: lastYearStart }, contactReason: { $in: ["product-support", "legal-inquiry", "general-inquiry", "other"] } } },
                    { $group: { _id: "$contactReason", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 1 }
                ])
            )[0]?._id || ''
        };

        return res.status(200).json({
            data: {
                currentTotalAnalytics,
                lastMonthAnalytics,
                lastYearAnalytics
            },
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}
