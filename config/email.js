import nodemailer from 'nodemailer';
import 'dotenv/config';
import logger from '../services/logger.js';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        logger.error('Email configuration error', {
            error: error.message,
            stack: error.stack
        });
    } else {
        logger.info('Email server is ready to send messages');
    }
});

export const sendLoginNotification = async (userEmail, userName) => {
    const mailOptions = {
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'New Login Alert',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Login Alert</h2>
                <p>Hello ${userName},</p>
                <p>We detected a new login to your account.</p>
                <p><strong>Login Details:</strong></p>
                <ul>
                    <li>Time: ${new Date().toLocaleString()}</li>
                    <li>Email: ${userEmail}</li>
                </ul>
                <p>If this was you, you can ignore this email. If you didn't log in, please secure your account immediately.</p>
                <p>Best regards,<br>Your App Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Login notification email sent successfully', {
            userEmail,
            userName
        });
    } catch (error) {
        logger.error('Error sending login notification email', {
            error: error.message,
            stack: error.stack,
            userEmail,
            userName
        });
        throw error;
    }
};
