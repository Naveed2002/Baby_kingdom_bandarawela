import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  ShoppingCart,
  Star,
  Crown,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'react-toastify';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    newThisMonth: 0,
    vip: 0,
    active: 0
  });

  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(API_ENDPOINTS.ADMIN_USERS, { 
        headers,
        params: {
          role: 'customer',
          limit: 100 // Get more customers for admin view
        }
      });
      
      if (response.data && response.data.users) {
        setCustomers(response.data.users);
      } else {
        console.error('Unexpected API response structure:', response.data);
        toast.error('Unexpected data format received');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (error.response?.status === 401) {
        toast.error('Please login as admin to access this page');
      } else {
        toast.error('Failed to load customers');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(API_ENDPOINTS.ADMIN_USERS_STATS, { headers });
      setCustomerStats(response.data);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      // Don't show error toast for stats as it's secondary data
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'vip') return matchesSearch && customer.customerGroup === 'VIP';
    if (filterType === 'premium') return matchesSearch && customer.customerGroup === 'Premium';
    if (filterType === 'regular') return matchesSearch && customer.customerGroup === 'Regular';
    if (filterType === 'new') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return matchesSearch && new Date(customer.createdAt) > oneMonthAgo;
    }
    
    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCustomerGroupBadge = (group) => {
    const badges = {
      VIP: 'bg-purple-100 text-purple-800',
      Premium: 'bg-blue-100 text-blue-800',
      Regular: 'bg-gray-100 text-gray-800'
    };
    return badges[group] || badges.Regular;
  };

  const getCustomerGroupIcon = (group) => {
    if (group === 'VIP') return <Crown className="w-4 h-4" />;
    if (group === 'Premium') return <Star className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  const CustomerProfile = ({ customer, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Customer Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl font-bold">
              {customer.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="text-lg font-semibold">{customer.name}</h4>
              <p className="text-gray-600">{customer.email}</p>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCustomerGroupBadge(customer.customerGroup)}`}>
                {getCustomerGroupIcon(customer.customerGroup)}
                <span>{customer.customerGroup}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{customer.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Joined {formatDate(customer.createdAt)}</span>
            </div>
          </div>

          {/* Address */}
          {customer.address && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
              <div>
                <p>{customer.address.street}</p>
                <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                <p>{customer.address.country}</p>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{customer.orderCount || 0}</p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Math.round(customer.loyaltyPoints || 0)}</p>
              <p className="text-sm text-gray-600">Loyalty Points</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{customer.lastOrder ? formatDate(customer.lastOrder) : 'Never'}</p>
              <p className="text-sm text-gray-600">Last Order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage customer profiles, purchase history, and loyalty programs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.newThisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VIP Customers</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.vip}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-gray-900">{customerStats.active}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="vip">VIP Customers</option>
                <option value="premium">Premium Customers</option>
                <option value="regular">Regular Customers</option>
                <option value="new">New This Month</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
                            {customer.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">Joined {formatDate(customer.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCustomerGroupBadge(customer.customerGroup)}`}>
                        {getCustomerGroupIcon(customer.customerGroup)}
                        <span>{customer.customerGroup}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.orderCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(customer.loyaltyPoints || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowProfile(true);
                        }}
                        className="text-primary hover:text-primary-dark mr-2"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Profile Modal */}
        {showProfile && selectedCustomer && (
          <CustomerProfile 
            customer={selectedCustomer} 
            onClose={() => {
              setShowProfile(false);
              setSelectedCustomer(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default Customers;