import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.VERIFY_EMAIL}?token=${token}`);
      
      setVerificationStatus('success');
      setMessage(response.data.message);
      setUser(response.data.user);
      
      // Store the token for automatic login
      localStorage.setItem('token', response.data.token);
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      await axios.post(`${API_ENDPOINTS.RESEND_VERIFICATION}`, {
        email: user.email
      });
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                You will be automatically redirected to the home page in a few seconds...
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Go to Home Page
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {user?.email && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm mb-3">
                  Didn't receive the verification email? We can send you a new one.
                </p>
                <button
                  onClick={handleResendVerification}
                  className="btn-outline text-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-outline w-full"
              >
                Register Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Baby Kingdom</h1>
            <p className="text-gray-600">Email Verification</p>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
