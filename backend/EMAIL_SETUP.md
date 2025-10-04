# Email Verification Setup Guide

## Overview
This guide will help you set up email verification for user registration in Baby Kingdom.

## Prerequisites
- Gmail account
- Node.js and npm installed
- MongoDB running

## Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

## Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click on "App passwords"
3. Generate a new app password for "Mail"
4. Copy the 16-character password

## Step 3: Configure Environment Variables
1. In the `baby-kingdom/backend` folder, edit the `.env` file
2. Update the following variables:

```env
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/baby-kingdom
```

## Step 4: Test the Setup
1. Start your backend server: `npm start`
2. Start your frontend: `npm run dev`
3. Try registering a new user
4. Check your email for the verification link
5. Click the verification link to verify your account

## How It Works
1. **User Registration**: When a user registers, a verification token is generated
2. **Email Sending**: A verification email is sent to the user's email address
3. **Email Verification**: User clicks the verification link in their email
4. **Account Activation**: The account is marked as verified and the user can log in

## Troubleshooting

### Email Not Sending
- Check your Gmail app password is correct
- Ensure 2FA is enabled on your Gmail account
- Check the console for error messages

### Verification Link Not Working
- Ensure the frontend URL in .env matches your actual frontend URL
- Check that the verification token hasn't expired (24 hours)
- Verify the backend is running on the correct port

### Port Issues
- Backend should run on port 5001
- Frontend should run on port 5173
- Update FRONTEND_URL in .env if using different ports

## Security Features
- Verification tokens expire after 24 hours
- Tokens are cryptographically secure (32 bytes random)
- Users cannot log in without email verification
- Failed email sends result in user account deletion

## API Endpoints
- `POST /api/auth/register` - Register new user (sends verification email)
- `GET /api/auth/verify-email?token=<token>` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/login` - Login (requires verified email)

## Frontend Routes
- `/register` - User registration form
- `/verify-email` - Email verification page
- `/login` - User login (only for verified users)
