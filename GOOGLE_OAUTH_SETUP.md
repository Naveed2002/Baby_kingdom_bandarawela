# Google OAuth Integration Setup Guide

## How It Works

When a user logs in with their Google account, the system automatically:

1. **Verifies the Google Token**: The backend verifies the Google ID token using Google's OAuth2 library
2. **Extracts User Information**: Gets the user's email, name, profile picture, and Google ID from their Google account
3. **Creates or Updates User**: 
   - If the email already exists in our database, it links the Google account to the existing user
   - If it's a new email, it creates a new user account with Google account information
4. **Auto-populates Profile**: The user's profile is automatically filled with:
   - **Name**: From Google account
   - **Email**: From Google account  
   - **Profile Picture**: From Google account
   - **Email Verification**: Automatically verified (Google accounts are pre-verified)
   - **Authentication Provider**: Marked as 'google'

## Setup Instructions

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API and Google Identity API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized domains:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (alternative dev port)
   - Your production domain
7. Copy the **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

**Backend (.env):**
```bash
# Replace with your actual Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Frontend (.env):**
```bash
# Replace with your actual Google Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Step 3: Test the Integration

1. Start both backend and frontend servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend  
   cd frontend && npm run dev
   ```

2. Go to the login or register page
3. Click "Continue with Google"
4. Complete Google authentication
5. User should be automatically logged in with their Google account information

## Features

### For Existing Users
- If a user already has an account with the same email, Google authentication will be linked to their existing account
- Their profile information will be updated with Google account details (if not already set)
- They can use either Google OAuth or regular login

### For New Users
- Creates a new account automatically using Google account information
- No need to set up a password initially (random password is generated)
- Email is automatically verified
- Profile picture is set from Google account
- User can complete additional profile information later (phone, address, etc.)

### Security Benefits
- **Email Verification**: Google accounts are pre-verified, so no email verification needed
- **Secure Authentication**: Uses Google's OAuth2 security standards  
- **No Password Storage**: For Google-only users, we don't store passwords locally
- **Token-based**: Uses JWT tokens for session management

## User Experience

1. **Login/Register Page**: Shows both regular form and "Continue with Google" button
2. **Google Popup**: Opens Google's secure authentication popup
3. **Auto-populate**: User profile is automatically filled with Google account data
4. **Seamless Integration**: User is redirected to appropriate page after authentication
5. **Profile Management**: Users can later update additional information (phone, address, etc.)

## Technical Implementation

### Backend Components
- **`googleAuthService.js`**: Handles Google token verification and user creation/update
- **`auth.js` routes**: Added `/api/auth/google` endpoint for Google authentication
- **`User.js` model**: Enhanced with Google OAuth fields (googleId, authProvider, profileImage)

### Frontend Components  
- **`GoogleSignIn.jsx`**: Reusable Google sign-in button component
- **`AuthContext.jsx`**: Updated to handle Google authentication flow
- **Login/Register pages**: Integrated Google sign-in options

### Database Schema Updates
The User model now includes:
- `googleId`: Unique Google account identifier
- `authProvider`: 'local' or 'google' 
- `profileImage`: URL to user's Google profile picture
- `emailVerified`: Auto-set to true for Google accounts

## Troubleshooting

### Common Issues

1. **"Google Client ID not found"**
   - Make sure `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
   - Restart the frontend development server after adding environment variables

2. **"Invalid Google token"**
   - Verify `GOOGLE_CLIENT_ID` matches between frontend and backend
   - Check that the Google OAuth application is properly configured

3. **CORS errors**
   - Ensure your domain is added to Google OAuth authorized domains
   - Check that backend CORS settings allow frontend domain

4. **Google popup blocked**
   - Browser may block popups - users need to allow popups for your site
   - Alternative: Use redirect-based authentication instead of popup

### Testing Checklist

- [ ] Google sign-in button appears on login/register pages
- [ ] Clicking button opens Google authentication popup
- [ ] Successful authentication creates/updates user account
- [ ] User profile shows Google account information
- [ ] Email is automatically verified
- [ ] Profile picture is displayed (if available)
- [ ] User can access protected routes after Google authentication
- [ ] Existing users can link their Google account
- [ ] New users get created with Google account details

## Next Steps

After basic setup, you can enhance the integration with:

1. **Profile Completion**: Prompt Google users to complete missing profile fields (phone, address)
2. **Social Features**: Display user profile pictures throughout the app
3. **Account Linking**: Allow users to link/unlink Google accounts from settings
4. **Analytics**: Track Google vs regular authentication usage
5. **Additional Providers**: Add Facebook, Twitter, or other OAuth providers

The Google OAuth integration provides a seamless, secure way for users to join your platform while automatically populating their profile with verified information from their Google account.