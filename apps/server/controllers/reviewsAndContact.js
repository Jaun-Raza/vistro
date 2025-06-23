import { Review } from '../models/review.js';
import { Contact } from '../models/contact.js';

export async function getReviews(req, res) {
    try {
        const reviews = await Review.find({}).sort({ createdAt: - 1 }).limit(5);

        if (reviews.length === 0) {
            return res.status(404).json({ error: "No Reviews Found", success: false });
        }

        return res.status(200).json({ reviews, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}

export async function contactSupport(req, res) {
    const { firstName, email, contactReason, message } = req.body.data;

    try {

        if (req.data.email !== email) {
            return res.status(401).json({error: "Use the email from which you are login with and then try again.", success: false})
        }

        const latestSubmission = await Contact.findOne({ email })
            .sort({ createdAt: -1 })

        if (latestSubmission) {
            const nextAllowedTime = new Date(latestSubmission.createdAt.getTime() + 24 * 60 * 60 * 1000);
            const now = new Date();

            if (now < nextAllowedTime) {
                return res.status(429).json({
                    error: `You can submit again after ${nextAllowedTime.toLocaleString()}`, success: false
                });
            }
        }

        const newContactSupportObj = new Contact({
            contactId: `contact_${Math.floor(Math.random() * 9999)}`,
            firstName,
            email,
            contactReason,
            message
        });

        await newContactSupportObj.save();
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong, try again later.", success: false });
    }
}