import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST || 'ssl0.ovh.net',
  port: parseInt(process.env.MAILER_PORT || '465'),
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.MAILER_USER || 'noreply.atlas@d-sap.tech',
    pass: process.env.MAILER_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.MAILER_PASSWORD) {
    console.warn('Email sending is disabled: SMTP credentials not configured');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.DEFAULT_MAILING_FROM_NAME || 'TimeTrack Pro'}" <${process.env.MAILER_USER || 'noreply.atlas@d-sap.tech'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generateUserWelcomeEmail(
  fullName: string,
  username: string,
  password: string,
  loginUrl: string
): { text: string; html: string } {
  const text = `
Hello ${fullName},

Welcome to TimeTrack Pro! Your account has been created.

Here are your login details:
Username: ${username}
Password: ${password}

Please login at: ${loginUrl}

We recommend changing your password after your first login.

Best regards,
The TimeTrack Pro Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;
    }
    .welcome {
      font-size: 24px;
      font-weight: bold;
      color: #4C6EF5;
    }
    .credentials {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .credentials p {
      margin: 5px 0;
    }
    .btn {
      display: inline-block;
      background-color: #4C6EF5;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="welcome">Welcome to TimeTrack Pro!</div>
    </div>
    
    <p>Hello ${fullName},</p>
    
    <p>Your TimeTrack Pro account has been created successfully.</p>
    
    <div class="credentials">
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>
    </div>
    
    <p>Please use these credentials to login to your account. We recommend changing your password after your first login.</p>
    
    <div style="text-align: center;">
      <a href="${loginUrl}" class="btn">Login to Your Account</a>
    </div>
    
    <p>If you have any questions or need assistance, please contact your administrator.</p>
    
    <p>Best regards,<br>The TimeTrack Pro Team</p>
    
    <div class="footer">
      This is an automated message. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
`;

  return { text, html };
}