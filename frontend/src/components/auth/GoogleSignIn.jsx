import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleSignIn = ({ className = '', children }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      // Check if Google Client ID is configured
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
        alert('Google OAuth is not configured. Please add your Google Client ID to the environment variables.');
        setLoading(false);
        return;
      }

      // Load Google API if not already loaded
      if (!window.google) {
        await loadGoogleAPI();
      }

      // Initialize Google Sign-In with FedCM-compatible configuration
      await window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        // Remove use_fedcm_for_prompt to use default (FedCM-compatible)
      });

      // Prompt for sign-in
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google Sign-In prompt not displayed:', notification.getNotDisplayedReason());
          // Fallback to renderButton if prompt fails
          renderGoogleButton();
        }
      });
    } catch (error) {
      console.error('Google Sign-In error:', error);
      alert('Failed to initialize Google Sign-In. Please check your internet connection and try again.');
      setLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Sending Google token to:', `${apiUrl}/api/auth/google`);
      
      const result = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: response.credential
        })
      });

      const data = await result.json();
      console.log('Google auth response:', data);

      if (result.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context - using the login function properly
        await login(data.user.email, null, true, data); // Pass Google auth data

        // Navigate based on user role
        if (data.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      
      // More specific error messages
      let errorMessage = 'Google sign-in failed. ';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Please check if the backend server is running and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage += 'Server configuration issue. Please contact support.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google API loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API:', error);
        reject(new Error('Failed to load Google API'));
      };
      document.head.appendChild(script);
    });
  };

  const renderGoogleButton = () => {
    try {
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(
          buttonContainer,
          {
            theme: 'outline',
            size: 'large',
            width: 350, // Use pixel value instead of percentage
            text: 'continue_with',
            shape: 'rectangular'
          }
        );
        // Show the container when button is rendered
        buttonContainer.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Failed to render Google button:', error);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {children || 'Continue with Google'}
          </>
        )}
      </button>
      {/* Fallback div for Google's renderButton */}
      <div id="google-signin-button" className="hidden w-full flex justify-center"></div>
    </>
  );
};

export default GoogleSignIn;