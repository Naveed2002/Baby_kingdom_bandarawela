import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ChevronDown } from 'lucide-react';
import { getAddressSuggestions, getProvinceByCity, getCitiesByProvince, getProvinces } from '../services/locationService';
import GoogleSignIn from '../components/auth/GoogleSignIn';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // Address suggestion states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableProvinces, setAvailableProvinces] = useState(getProvinces());
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Handle address suggestions
  const handleAddressSearch = async (value) => {
    if (value.length < 2) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getAddressSuggestions(value);
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle address suggestion selection
  const handleAddressSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        street: suggestion.description,
        city: suggestion.city,
        state: suggestion.state,
        country: suggestion.country || 'Sri Lanka'
      }
    }));
    setShowAddressSuggestions(false);
    
    // Update available cities when state is selected
    if (suggestion.state) {
      setAvailableCities(getCitiesByProvince(suggestion.state));
    }
  };

  // Handle state change to update cities
  const handleStateChange = (selectedState) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state: selectedState,
        city: '' // Reset city when state changes
      }
    }));
    setAvailableCities(getCitiesByProvince(selectedState));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      // Special handling for address street field
      if (parent === 'address' && child === 'street') {
        handleAddressSearch(value);
      }
      
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      };

      const result = await register(userData);
      if (result.success) {
        setRegistrationSuccess(true);
        setVerificationEmail(formData.email);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-white text-opacity-90">
            Join Baby Kingdom today
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
              
              <div className="relative">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="street"
                    name="address.street"
                    type="text"
                    autoComplete="street-address"
                    required
                    value={formData.address.street}
                    onChange={handleChange}
                    onFocus={() => formData.address.street.length >= 2 && setShowAddressSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                    className={`input-field pl-10 ${errors.street ? 'border-red-500' : ''}`}
                    placeholder="Start typing your address..."
                  />
                  {isLoadingSuggestions && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Address Suggestions Dropdown */}
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-primary focus:text-white outline-none"
                        onClick={() => handleAddressSelect(suggestion)}
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{suggestion.description}</div>
                            {suggestion.state && (
                              <div className="text-sm text-gray-500">{suggestion.state}, {suggestion.country}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Province/State
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="address.state"
                      required
                      value={formData.address.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className={`input-field appearance-none pr-10 ${errors.state ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Province</option>
                      {availableProvinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      name="address.city"
                      required
                      value={formData.address.city}
                      onChange={handleChange}
                      disabled={!formData.address.state}
                      className={`input-field appearance-none pr-10 ${errors.city ? 'border-red-500' : ''} ${!formData.address.state ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">
                        {!formData.address.state ? 'Select Province First' : 'Select City'}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  {!formData.address.state && (
                    <p className="mt-1 text-xs text-gray-500">Please select a province first</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="address.zipCode"
                  type="text"
                  autoComplete="postal-code"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="ZIP Code (optional)"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Email Verification Success Message */}
          {registrationSuccess && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Check Your Email!</h3>
                <p className="text-green-700 mb-4">
                  We've sent a verification link to <strong>{verificationEmail}</strong>
                </p>
                <p className="text-green-600 text-sm mb-4">
                  Click the link in your email to verify your account and start shopping!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setRegistrationSuccess(false);
                      setFormData({
                        name: '',
                        email: '',
                        username: '',
                        password: '',
                        confirmPassword: '',
                        phone: '',
                        address: { street: '', city: '', state: '', zipCode: '', country: 'Sri Lanka' }
                      });
                    }}
                    className="btn-primary w-full"
                  >
                    Register Another Account
                  </button>
                  <Link
                    to="/login"
                    className="btn-outline w-full text-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced divider with Google Sign-In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleSignIn />
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full btn-outline text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white text-opacity-80 text-sm">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-white hover:text-secondary underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-white hover:text-secondary underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
