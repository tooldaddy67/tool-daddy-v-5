import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';

/**
 * Send a security notification email to the user.
 * @param {string} email - User's email address
 * @param {string} subject - Email subject
 * @param {string} message - Email body
 */
export async function sendSecurityNotification(email: string, subject: string, message: string) {
  // Configure your SMTP transport (use environment variables for credentials)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'security@tool-daddy.com',
    to: email,
    subject,
    text: message,
  });
}

/**
 * Example: Call this after a new login or password change event.
 */
export async function notifyUserOfLogin(userId: string, ip: string) {
  const user = await getAuth().getUser(userId);
  if (user.email) {
    await sendSecurityNotification(
      user.email,
      'New Login Detected',
      `A new login to your Tool Daddy account was detected from IP: ${ip} on ${new Date().toLocaleString()}. If this wasn't you, please reset your password immediately.`
    );
  }
}

export async function notifyUserOfPasswordChange(userId: string) {
  const user = await getAuth().getUser(userId);
  if (user.email) {
    await sendSecurityNotification(
      user.email,
      'Your Password Was Changed',
      `Your Tool Daddy account password was changed on ${new Date().toLocaleString()}. If this wasn't you, please contact support immediately.`
    );
  }
}
