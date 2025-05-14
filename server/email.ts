import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE,
  host: process.env.MAILER_HOST,
  port: Number(process.env.MAILER_PORT),
  secure: true, // true for port 465
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${process.env.DEFAULT_MAILING_FROM_NAME}" <${process.env.DEFAULT_MAILING_FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export function generateUserWelcomeEmail(
  fullName: string,
  username: string,
  password: string,
  appUrl: string
): { text: string; html: string } {
  const text = `
Welcome to TimeTrack Pro, ${fullName}!

Your account has been created successfully. Below are your login credentials:

Username: ${username}
Password: ${password}

Please login at: ${appUrl}

We recommend changing your password after your first login.

Thank you,
The TimeTrack Pro Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4A55A2;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .credentials {
      background-color: #fff;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #eee;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #4A55A2;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to TimeTrack Pro</h1>
    </div>
    <div class="content">
      <p>Hello ${fullName},</p>
      
      <p>Your account has been created successfully. Below are your login credentials:</p>
      
      <div class="credentials">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      
      <p>We recommend changing your password after your first login for security purposes.</p>
      
      <a href="${appUrl}" class="button">Login to Your Account</a>
      
      <p>If you have any questions or need assistance, please contact our support team.</p>
      
      <p>Thank you,<br>The TimeTrack Pro Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TimeTrack Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return { text, html };
}