import nodemailer from 'nodemailer';

const hasPlaceholderValue = (value = '') =>
  [
    'your_email@gmail.com',
    'your_app_password_here',
    'your_gmail_app_password',
    'noreply@tutorify.com',
  ].includes(value);

const parseBoolean = (value) => `${value}`.toLowerCase() === 'true';

const normalizeEmailConfig = () => {
  const service = (process.env.EMAIL_SERVICE || '').trim().toLowerCase();
  const user = (process.env.EMAIL_USER || '').trim();
  const rawPassword = (process.env.EMAIL_PASSWORD || '').trim();
  const isGmail = service === 'gmail' || process.env.EMAIL_HOST === 'smtp.gmail.com';
  const password = isGmail ? rawPassword.replace(/\s+/g, '') : rawPassword;
  const host = process.env.EMAIL_HOST || (isGmail ? 'smtp.gmail.com' : '');
  const port = Number(process.env.EMAIL_PORT || (isGmail ? 465 : 587));
  const secure = process.env.EMAIL_SECURE ? parseBoolean(process.env.EMAIL_SECURE) : port === 465;
  const from = (process.env.EMAIL_FROM || user).trim();

  return {
    service,
    isGmail,
    host,
    port,
    secure,
    user,
    password,
    from,
  };
};

export const isEmailConfigured = () => {
  const config = normalizeEmailConfig();
  const requiredValues = [config.host, config.port, config.user, config.password, config.from];

  return requiredValues.every(Boolean)
    && !hasPlaceholderValue(config.user)
    && !hasPlaceholderValue(config.password)
    && !hasPlaceholderValue(config.from);
};

const createTransporter = () => {
  const config = normalizeEmailConfig();

  if (config.isGmail) {
    // Render often hangs on port 465 with Google SMTP. Force port 587 (STARTTLS).
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
};

export const sendEmail = async (to, subject, html) => {
  try {
    if (!isEmailConfigured()) {
      throw new Error('Email service is not configured');
    }

    const config = normalizeEmailConfig();
    const transporter = createTransporter();
    const mailOptions = {
      from: config.from,
      to,
      subject,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
      <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong> only.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">© 2024 Tutorify. All rights reserved.</p>
    </div>
  `;
  
  await sendEmail(email, 'Verify Your Email - OTP', html);
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Tutorify, ${name}!</h2>
      <p>Thank you for signing up. We're excited to have you on our platform.</p>
      <p><a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
      <p style="color: #666; font-size: 14px;">If you have any questions, feel free to contact our support team.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">© 2024 Tutorify. All rights reserved.</p>
    </div>
  `;
  
  await sendEmail(email, 'Welcome to Tutorify!', html);
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p style="color: #666; font-size: 14px;">This link is valid for <strong>30 minutes</strong> only.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">© 2024 Tutorify. All rights reserved.</p>
    </div>
  `;
  
  await sendEmail(email, 'Reset Your Password', html);
};
