# Google OAuth Error Troubleshooting Guide

## 🚨 Error Analysis

You're encountering three related Google OAuth errors:

### 1. `ERR_FAILED` Network Error
**Cause**: The Google Identity Services can't reach the authentication endpoint
**Reason**: Usually caused by CORS issues or network connectivity problems

### 2. `Server did not send the correct CORS headers`
**Cause**: Your backend server isn't configured to accept requests from Google's domains
**Reason**: Missing or inadequate CORS configuration

### 3. `FedCM get() rejects with IdentityCredentialError`
**Cause**: Google's Federated Credential Management API failed
**Reason**: Browser compatibility issues or configuration problems

## ✅ Fixes Applied

### 1. Enhanced CORS Configuration
Updated `server.js` to include proper CORS settings for Google OAuth:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://accounts.google.com',
    'https://www.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};
```

### 2. Improved Google OAuth Component
Enhanced error handling and compatibility:

- ✅ Added environment variable validation
- ✅ Disabled FedCM to avoid browser compatibility issues
- ✅ Added fallback button rendering
- ✅ Improved error messages
- ✅ Better logging for debugging

### 3. Added Meta Tag
Added Google OAuth meta tag to `index.html` for better integration.

## 🛠️ Complete Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and Google Identity API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized origins:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   ```
7. Add authorized redirect URIs:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:3000
   ```

### Step 2: Update Environment Variables

**Backend `.env`:**
```bash
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

**Frontend `.env`:**
```bash
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
```

**Frontend `index.html`:**
Replace the meta tag with your actual client ID:
```html
<meta name="google-signin-client_id" content="your-actual-google-client-id" />
```

### Step 3: Restart Both Servers
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

## 🔍 Testing Checklist

- [ ] Backend server running on port 5000/5001
- [ ] Frontend server running on port 5173/5174
- [ ] Google Client ID configured in both environments
- [ ] Google Cloud Console has correct authorized domains
- [ ] CORS headers are being sent (check browser Network tab)
- [ ] No console errors when clicking Google button
- [ ] Google authentication popup opens successfully

## 🛡️ Common Issues & Solutions

### Issue 1: "Google OAuth is not configured"
**Solution**: Make sure `VITE_GOOGLE_CLIENT_ID` is set and not the placeholder value

### Issue 2: Still getting CORS errors
**Solution**: 
1. Check that authorized origins in Google Console match your dev server URL
2. Make sure backend server is running
3. Verify the CORS configuration is applied

### Issue 3: FedCM errors in Chrome
**Solution**: The updated code disables FedCM (`use_fedcm_for_prompt: false`) to avoid browser compatibility issues

### Issue 4: "Failed to load Google API"
**Solution**: Check internet connection and make sure the Google API script can be loaded

## 🔧 Debug Commands

### Check if CORS headers are being sent:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/auth/google
```

### Check Google API loading:
Open browser console and check if this returns an object:
```javascript
console.log(window.google);
```

### Test backend endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"googleToken":"test"}'
```

## 📱 Browser Compatibility

The updated configuration should work with:
- ✅ Chrome (latest)
- ✅ Firefox (latest) 
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🚀 Next Steps

1. **Get your Google OAuth credentials** from Google Cloud Console
2. **Update environment variables** with real values
3. **Restart both servers** to apply changes
4. **Test the Google sign-in** functionality
5. **Check browser console** for any remaining errors

The enhanced error handling will now provide clearer messages if issues persist, making it easier to identify and fix any remaining problems.

## 💡 Pro Tips

- Always test in an incognito/private browser window first
- Check the Network tab in browser dev tools for failed requests
- Make sure your development server URL matches exactly what's in Google Console
- The Google button will show helpful error messages if configuration is missing

With these fixes, your Google OAuth integration should work smoothly! 🎉