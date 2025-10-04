const nodemailer = require('nodemailer');

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail app password
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Baby Kingdom - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Baby Kingdom</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Welcome to our family!</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Hello ${name}!</h2>
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for registering with Baby Kingdom! To complete your registration and start shopping for the best baby products, please verify your email address.
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.3s;">
                Verify Email Address
              </a>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #4f46e5; margin: 10px 0; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                This verification link will expire in 24 hours. If you didn't create an account with Baby Kingdom, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Baby Kingdom - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Baby Kingdom</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Hello ${name}!</h2>
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.3s;">
                Reset Password
              </a>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #4f46e5; margin: 10px 0; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
