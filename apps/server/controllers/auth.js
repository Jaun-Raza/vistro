import bcrypt from 'bcrypt';
import cron from 'node-cron';
import transporter from '../middlewares/transporter.js';
import axios from 'axios';
import 'dotenv/config.js'

// User Model
import { User } from '../models/user.js';
import { signToken } from '../middlewares/authMiddleware.js';

const TOKEN_EXPIRATION_DAYS = 30;

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_HOST = process.env.RECAPTCHA_HOST;

async function verifyRecaptcha(token) {
    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: token
                }
            }
        );

        const data = response.data;

        if (data.success) {
            if (data.hostname !== RECAPTCHA_HOST) {
                console.warn('reCAPTCHA domain mismatch:', data.hostname);
                return false;
            }

            const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
            if (data.challenge_ts && new Date(data.challenge_ts).getTime() < twoMinutesAgo) {
                console.warn('reCAPTCHA token too old');
                return false;
            }

            return true;
        }

        return false;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
}

export async function signUp(req, res) {
    const { email, username, password, country, day, month, year, gender, discordUserId, recaptchaToken } = req.body.data;

    const salts = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salts);
    const code = `${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}`;

    const newUser = new User({
        email,
        username,
        password: hashedPassword,
        discordUserId,
        day,
        month,
        year,
        country,
        gender,
        verificationLink: code,
    })

    try {

        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);

        if (!isRecaptchaValid) {
            return {
                success: false,
                error: 'reCAPTCHA verification failed. Please try again.'
            };
        }

        const isUserExisted = await User.findOne({ email: email });
        const isUserNameExisted = await User.findOne({ username: username });

        if (isUserExisted) return res.status(409).json({ error: 'Email has been used', success: false });
        if (isUserNameExisted) return res.status(409).json({ error: 'Username is already taken', success: false });

        const message = {
            from: "'Vistro' <noreply@vistro.shop>",
            to: email,
            subject: 'SignUp Verification',
            html: `
               <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SignUp Verification - Vistro</title>
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
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .title {
            color: #1e293b;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 20px 0;
        }
        .welcome-text {
            color: #64748b;
            font-size: 18px;
            margin: 0 0 30px 0;
            line-height: 1.5;
        }
        .message {
            color: #475569;
            font-size: 16px;
            margin: 0 0 30px 0;
            line-height: 1.5;
        }
        .verification-container {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
        }
        .verify-label {
            color: #1e40af;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 20px 0;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .link-container {
            margin: 25px 0;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .link-text {
            color: #64748b;
            font-size: 14px;
            margin: 0 0 10px 0;
        }
        .verification-link {
            color: #3b82f6;
            font-size: 14px;
            word-break: break-all;
            text-decoration: none;
            font-family: 'Courier New', monospace;
        }
        .expiry-warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text {
            color: #92400e;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
        }
        .benefits {
            text-align: left;
            background-color: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .benefits-title {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px 0;
            text-align: center;
        }
        .benefits-list {
            color: #475569;
            font-size: 15px;
            margin: 10px 0;
            padding-left: 20px;
        }
        .benefits-list li {
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
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 class="logo">VISTRO</h1>
        </div>

        <div class="content">
            <h2 class="title">Welcome to Vistro!</h2>
            <p class="welcome-text">
                Thank you for joining our community. You're just one step away from getting started.
            </p>
            <p class="message">
                Please verify your email address to activate your account and unlock all features.
            </p>

            <div class="verification-container">
                <p class="verify-label">Click the button below to verify your account:</p>
                <a href="${process.env.MAIN_WEB_URL}/verify/${code}" class="verify-button">
                    Verify My Account
                </a>
            </div>

            <div class="link-container">
                <p class="link-text">Or copy and paste this link in your browser:</p>
                <a href="${process.env.MAIN_WEB_URL}/verify/${code}" class="verification-link">
                    ${process.env.MAIN_WEB_URL}/verify/${code}
                </a>
            </div>

            <div class="benefits">
                <p class="benefits-title">What you get with your verified account:</p>
                <ul class="benefits-list">
                    <li>Full access to all Vistro features</li>
                    <li>Secure account protection</li>
                    <li>Personalized shopping experience</li>
                    <li>Exclusive offers and updates</li>
                </ul>
            </div>

            <div class="expiry-warning">
                <p class="warning-text">
                    <strong>Important:</strong> This verification link will expire in 24 hours. Please verify your account as soon as possible.
                </p>
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

        await newUser.save();

        return res.status(200).json({ message: "Successfully Registered! check your email for verify your account.", success: true });
    } catch (err) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}



export async function logIn(req, res) {
    const { emailOrUsername, recaptchaToken, password } = req.body.data;

    try {

        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);

        if (!isRecaptchaValid) {
            return res.status(400).json({
                success: false,
                error: 'reCAPTCHA verification failed. Please try again.'
            });
        }

        const foundUser = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!foundUser) {
            return res.status(409).json({ error: 'Invalid Credentials, try register yourself!', success: false });
        }

        if (!foundUser.isVerified) {
            return res.status(409).json({ error: 'Try verifying yourself through the link that is already sent on your registered email.', success: false });
        }

        const comparePass = await bcrypt.compare(password, foundUser.password);

        if (!comparePass) {
            return res.status(401).json({ error: "Invalid Credentials", success: false });
        }

        const token = await signToken(foundUser.email, foundUser.username);

        if (token === "Internal Server Error") {
            return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
        }

        foundUser.tokens?.push({
            token,
            createdAt: new Date(Date.now())
        });
        await foundUser.save();

        return res.status(200).json({ success: true, token, message: "Login Successful." });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function forgotPassChallenge(req, res) {
    const { email } = req.body;

    try {
        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.status(409).json({ error: 'There is no user with this email, try register yourself!', success: false });
        }

        let otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        foundUser.otp = {
            otp,
            expiresAt: new Date(Date.now() + 1 * 60 * 1000)
        }

        foundUser.save();

        const message = {
            from: "'Vistro' <noreply@vistro.shop>",
            to: email,
            subject: 'OTP For Password Recovery',
            html: `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP For Password Recovery - Vistro</title>
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
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .title {
            color: #1e293b;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
        }
        .message {
            color: #64748b;
            font-size: 16px;
            margin: 0 0 30px 0;
            line-height: 1.5;
        }
        .otp-container {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        .otp-label {
            color: #1e40af;
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .otp-code {
            color: #1e40af;
            font-size: 36px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            letter-spacing: 4px;
            margin: 0;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text {
            color: #92400e;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
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
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 class="logo">VISTRO</h1>
        </div>

        <div class="content">
            <h2 class="title">Password Recovery Request</h2>
            <p class="message">
                We received a request to reset your password. Use the verification code below to complete the process.
            </p>

            <div class="otp-container">
                <p class="otp-label">Your Verification Code</p>
                <p class="otp-code">${otp}</p>
            </div>

            <div class="instructions">
                <strong>How to use this code:</strong>
                <ul>
                    <li>Enter this code on the password reset page</li>
                    <li>This code is valid for 10 minutes only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>

            <!-- Warning -->
            <div class="warning">
                <p class="warning-text">
                    <strong>Security Notice:</strong> This code will expire in 10 minutes for your security. If you didn't request a password reset, please secure your account immediately.
                </p>
            </div>
        </div>

        <div class="divider"></div>

        <!-- Footer -->
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

        return res.status(200).json({ message: 'The OTP is sent to your email!', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function verifyOTP(req, res) {
    const { email, otp } = req.body;

    try {
        const foundUser = await User.findOne({ email });

        console.log(email)

        if (!foundUser) {
            return res.status(409).json({ error: 'There is no user with this email, try register yourself!', success: false });
        }

        if (new Date() > new Date(foundUser.otp.expiresAt)) {
            return res.status(400).json({ error: "OTP is expired, try re-generate it!", success: false });
        }

        if (parseInt(otp) !== foundUser.otp.otp) {
            return res.status(400).json({ error: "Wrong OTP entered!", success: false });
        }

        return res.status(200).json({ message: "OTP matched!", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function forgotPass(req, res) {
    const { email, otp, password } = req.body;

    try {

        if (!otp) {
            return res.status(409).json({ error: 'OTP is required!', success: false });
        }

        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.status(409).json({ error: 'There is no user with this email, try register yourself!', success: false });
        }

        if (parseInt(otp) !== foundUser.otp.otp) {
            return res.status(400).json({ error: "Wrong OTP entered!", success: false });
        }

        const comparePass = await bcrypt.compare(password, foundUser.password);

        if (comparePass) {
            return res.status(401).json({ error: "Old password cannot be the new password.", success: false });
        }

        const salts = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salts);

        foundUser.password = hashedPassword;
        foundUser.save();
        return res.status(200).json({ message: "Password is changed successfully!", success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

export async function verify(req, res) {
    const { code } = req.query;

    try {
        const foundUser = await User.findOne({ verificationLink: code });

        if (!foundUser) {
            return res.status(409).json({ error: 'There is no valid verification code comparing to this, try register yourself!', success: false });
        }

        if (foundUser.isVerified) {
            return res.status(409).json({ error: 'The user is already verified!', success: false });
        }

        foundUser.isVerified = true;
        foundUser.save()

        return res.status(200).json({ message: "User is successfully verified!", success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Somthing went wrong, try again later!", success: false });
    }
}

// export async function getData(req, res) {
//     const data = req.data;

//     await User.findOne({ email: data.email }).then((foundUser) => {
//         return res.status(200).json({
//             user: {
//                 email: foundUser.email,
//                 username: foundUser.username,
//                 isAdmin: foundUser.isAdmin
//             }, success: true
//         });
//     });
// }



function isTokenExpired(createdAt) {
    const createdDate = new Date(createdAt);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(createdDate.getDate() + TOKEN_EXPIRATION_DAYS);
    return expirationDate < new Date();
}

cron.schedule('0 0 * * *', async () => {
    console.log('Running the token cleanup task...');

    try {
        const users = await User.find();

        for (const user of users) {
            const validTokens = user.tokens.filter(token => {
                const createdAt = token.createdAt instanceof Date ? token.createdAt : new Date(token.createdAt);
                return !isTokenExpired(createdAt);
            });

            if (validTokens.length !== user.tokens.length) {
                user.tokens = validTokens;
                await user.save();
                console.log(`Expired tokens removed for user: ${user.email}`);
            }
        }

    } catch (err) {
        console.error('Error during token cleanup:', err);
    }
});

cron.schedule('0 0 * * *', async () => {
    console.log('Running task for removing unverified users...');

    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const usersToDelete = await User.find({
            isVerified: false,
            createdAt: { $lt: threeDaysAgo }
        });

        for (const user of usersToDelete) {
            await User.deleteOne({ _id: user._id });
            console.log(`Deleted unverified user: ${user.email}`);
        }

    } catch (err) {
        console.error('Error during unverified user cleanup:', err);
    }
});