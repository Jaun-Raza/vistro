import nodemailer from 'nodemailer';
import 'dotenv/config';

const emailConfig = {
  host: 'smtp.zeptomail.eu',
  port: 587,
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