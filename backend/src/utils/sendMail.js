import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { asynchHandler } from './AsynchHandler.js';
dotenv.config();

const sendMail =asynchHandler( async ({ from, to, subject, text }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        const mailOptions = {
            from,
            to,
            subject,
            text,
        };

        console.log('Sending email with options:', mailOptions);

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});

export default sendMail;