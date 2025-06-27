import nodemailer from 'nodemailer';
import 'dotenv/config';

const emailConfig = {
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
  },
  // tls: {
  //   rejectUnauthorized: false
  // }
};

const transporter = nodemailer.createTransport(emailConfig);

export default transporter;