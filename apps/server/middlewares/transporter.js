import nodemailer from 'nodemailer';
import 'dotenv/config';

const emailConfig = {
  host: 'smtp.zeptomail.eu',
  port: 587,
  auth: {
    user: "emailapikey",
    pass: process.env.PASS
  }
};

const transporter = nodemailer.createTransport(emailConfig);

export default transporter;