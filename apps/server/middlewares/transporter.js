import nodemailer from 'nodemailer';
import 'dotenv/config';

const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
  },
  tls: {
    rejectUnauthorized: false
  }
};

const transporter = nodemailer.createTransport(emailConfig);

export default transporter;