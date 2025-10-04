import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Package,
  Heart,
  Settings,
  Shield,
  CreditCard,
  Truck,
  Star,
  Calendar,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { cartCount } = useCart();
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });
  
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Sri Lanka'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Debug information
  useEffect(() => {
    console.log('Profile Debug Info:');
    console.log('Current user:', user);
    console.log('Token from localStorage:', localStorage.getItem('token'));
    console.log('Axios default auth header:', axios.defaults.headers.common['Authorization']);
  }, [user]);
  
  // Initialize forms with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || ''
      });
      
      setAddressForm({
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'Sri Lanka'
      });
    }
  }, [user]);
  
  // Fetch user orders
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);
  
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(API_ENDPOINTS.ORDERS);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    try {
      // Validate required fields
      if (!profileForm.name || !profileForm.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Validate phone number format (basic validation)
      if (profileForm.phone && !/^[+]?[0-9\s\-\(\)]{10,}$/.test(profileForm.phone)) {
        toast.error('Please enter a valid phone number');
        return;
      }
      
      const result = await updateProfile(profileForm);
      if (result.success) {
        setIsEditingProfile(false);
        // The user state will be updated by the AuthContext
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
    }
  };
  
  const handleAddressUpdate = async () => {
    try {
      // Validate required address fields
      if (!addressForm.street || !addressForm.city || !addressForm.state) {
        toast.error('Please fill in all required address fields');
        return;
      }
      
      const result = await updateProfile({ address: addressForm });
      if (result.success) {
        setIsEditingAddress(false);
        toast.success('Address updated successfully!');
      }
    } catch (error) {
      console.error('Address update error:', error);
      toast.error('Failed to update address');
    }
  };
  
  // Debug function to test authentication
  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const response = await axios.get(API_ENDPOINTS.ME);
      console.log('Auth test successful:', response.data);
      toast.success('Authentication is working!');
    } catch (error) {
      console.error('Auth test failed:', error.response?.data || error.message);
      toast.error(`Auth test failed: ${error.response?.data?.message || error.message}`);
    }
  };
  
  const cancelEdit = () => {
    setIsEditingProfile(false);
    setIsChangingPassword(false);
    setIsEditingAddress(false);
    
    // Reset forms to original values
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || ''
      });
      
      setAddressForm({
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'Sri Lanka'
      });
    }
    
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile</h1>
            <p className="text-xl text-gray-600 mb-6">Please log in to view your profile.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                Debug Info:<br/>
                • Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Missing'}<br/>
                • User state: {user ? 'Loaded' : 'Not loaded'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name || 'User Profile'}</h1>
          <p className="text-xl text-gray-600">{user.email}</p>
          
          {/* Debug button - remove this after testing */}
          <button 
            onClick={testAuth}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Test Authentication
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
            <p className="text-gray-600">Total Orders</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{cartCount}</h3>
            <p className="text-gray-600">Items in Cart</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{user.role === 'customer' ? 'Customer' : 'Guest'}</h3>
            <p className="text-gray-600">Account Type</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'address', label: 'Address', icon: MapPin },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'preferences', label: 'Preferences', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleProfileUpdate}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your phone number"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    {isEditingProfile ? (
                      <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    {isEditingProfile ? (
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not provided'}</p>
                    )}
                  </div>
                </div>
                
                {isEditingProfile && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="text-red-500">*</span> Required fields. Please ensure your information is accurate.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Start shopping to see your order history here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Order #{order._id.slice(-8)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                            <div className="space-y-2">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{item.name} x{item.quantity}</span>
                                  <span className="text-gray-600">{formatCurrency(item.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress?.street}<br />
                              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                              {order.shippingAddress?.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Address Tab */}
            {activeTab === 'address' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                  {!isEditingAddress ? (
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Address</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAddressUpdate}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    {isEditingAddress ? (
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your street address"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.street || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    {isEditingAddress ? (
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your city"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.city || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province <span className="text-red-500">*</span>
                    </label>
                    {isEditingAddress ? (
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your state or province"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.state || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                    {isEditingAddress ? (
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your ZIP or postal code"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address?.zipCode || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    {isEditingAddress ? (
                      <select
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="India">India</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Maldives">Maldives</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.address?.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                
                {isEditingAddress && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="text-red-500">*</span> Required fields. Please ensure your address is accurate for delivery purposes.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePasswordChange}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                        >
                        <Save className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {isChangingPassword ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-medium text-gray-900">Account Security</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Keep your account secure by regularly updating your password and using a strong, unique password.
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Use at least 6 characters</p>
                      <p>• Include a mix of letters, numbers, and symbols</p>
                      <p>• Avoid using personal information</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences & Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Mail className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-900">Email Preferences</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Order updates and tracking</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Product recommendations</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="ml-2 text-sm text-gray-700">Newsletter and promotions</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Truck className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-medium text-gray-900">Shipping Preferences</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="radio" name="shipping" className="text-primary focus:ring-primary" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Standard shipping (3-5 days)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="shipping" className="text-primary focus:ring-primary" />
                        <span className="ml-2 text-sm text-gray-700">Express shipping (1-2 days)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-medium text-gray-900">Payment Preferences</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Save payment methods</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="ml-2 text-sm text-gray-700">Auto-fill billing address</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Heart className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-medium text-gray-900">Personalization</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Personalized recommendations</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Recently viewed items</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
