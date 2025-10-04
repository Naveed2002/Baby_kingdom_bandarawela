import { useState, useEffect } from 'react';
import { 
  Tag, 
  Gift, 
  Percent, 
  Calendar, 
  Users, 
  Search, 
  Plus, 
  Edit3,
  Eye,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Discounts = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real discount data from API
  const [discountData, setDiscountData] = useState({
    overview: {
      totalCoupons: 0,
      activeCoupons: 0,
      expiredCoupons: 0,
      usedCoupons: 0,
      totalSavings: 0
    },
    coupons: [],
    seasonalOffers: [
      {
        id: 1,
        name: 'New Year Sale',
        discount: 25,
        type: 'percentage',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'active',
        products: 'all',
        sales: 89000
      },
      {
        id: 2,
        name: 'Valentine Special',
        discount: 15,
        type: 'percentage',
        startDate: '2024-02-10',
        endDate: '2024-02-20',
        status: 'scheduled',
        products: 'gifts',
        sales: 0
      }
    ],
    automaticDiscounts: [
      {
        id: 1,
        name: 'Buy 2 Get 1 Free',
        type: 'buy_x_get_y',
        buyQuantity: 2,
        getQuantity: 1,
        applicableProducts: 'clothing',
        status: 'active',
        uses: 156
      },
      {
        id: 2,
        name: 'Bulk Order Discount',
        type: 'bulk',
        threshold: 5000,
        discount: 10,
        status: 'active',
        uses: 23
      }
    ]
  });

  // Fetch discount data
  useEffect(() => {
    fetchDiscountData();
  }, []);

  const fetchDiscountData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch overview data
      const overviewResponse = await axios.get(API_ENDPOINTS.ADMIN_DISCOUNTS_OVERVIEW, { headers });
      
      // Fetch coupons data
      const couponsResponse = await axios.get(API_ENDPOINTS.ADMIN_DISCOUNTS, { 
        headers,
        params: { status: filterStatus, search: searchTerm }
      });

      setDiscountData(prev => ({
        ...prev,
        overview: overviewResponse.data.overview,
        coupons: couponsResponse.data.coupons || []
      }));
    } catch (error) {
      console.error('Error fetching discount data:', error);
      setError('Failed to fetch discount data');
      toast.error('Failed to load discount data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when filters change
  useEffect(() => {
    if (!loading) {
      fetchDiscountData();
    }
  }, [filterStatus, searchTerm]);

  const createCoupon = async (couponData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(API_ENDPOINTS.ADMIN_DISCOUNTS, couponData, { headers });
      
      toast.success('Coupon created successfully!');
      fetchDiscountData(); // Refresh data
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied!');
  };

  const filteredCoupons = discountData.coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || coupon.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discount data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDiscountData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const CreateCouponModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      usageLimit: '',
      minOrderValue: '',
      startDate: '',
      endDate: '',
      applicableProducts: 'all',
      customerType: 'all'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      await createCoupon(formData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Create New Coupon</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., SAVE20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value {formData.type === 'percentage' ? '(%)' : '(LKR)'}
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                rows="2"
                placeholder="Describe this coupon..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discounts & Coupons</h1>
              <p className="text-gray-600">Manage promotional codes, seasonal offers, and automatic discounts</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-outline flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>Bulk Generate</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Coupon</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                <p className="text-3xl font-bold text-gray-900">{discountData.overview.totalCoupons}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-3xl font-bold text-green-600">{discountData.overview.activeCoupons}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Used Coupons</p>
                <p className="text-3xl font-bold text-blue-600">{discountData.overview.usedCoupons}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-red-600">{discountData.overview.expiredCoupons}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(discountData.overview.totalSavings)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Coupon Codes', icon: Tag },
                { id: 'seasonal', name: 'Seasonal Offers', icon: Calendar },
                { id: 'automatic', name: 'Automatic Discounts', icon: Percent },
                { id: 'analytics', name: 'Performance', icon: Eye }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search coupons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {/* Coupons Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCoupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {coupon.code}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(coupon.code)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-sm text-gray-500">{coupon.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min order: {formatCurrency(coupon.minOrderValue)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {coupon.usedCount} / {coupon.usageLimit}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{coupon.startDate}</div>
                            <div className="text-sm text-gray-500">to {coupon.endDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(coupon.status)}
                              {getStatusBadge(coupon.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-primary hover:text-primary-dark">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'seasonal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discountData.seasonalOffers.map((offer) => (
                  <div key={offer.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium">
                          {offer.type === 'percentage' ? `${offer.discount}%` : formatCurrency(offer.discount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm font-medium">{offer.startDate} to {offer.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Products:</span>
                        <span className="text-sm font-medium capitalize">{offer.products}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sales:</span>
                        <span className="text-sm font-medium">{formatCurrency(offer.sales)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-primary text-white py-2 px-4 rounded-md text-sm hover:bg-primary-dark">
                        Edit Offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'automatic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {discountData.automaticDiscounts.map((discount) => (
                  <div key={discount.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{discount.name}</h3>
                      {getStatusBadge(discount.status)}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium capitalize">{discount.type.replace('_', ' ')}</span>
                      </div>
                      {discount.type === 'buy_x_get_y' && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rule:</span>
                          <span className="text-sm font-medium">Buy {discount.buyQuantity} Get {discount.getQuantity}</span>
                        </div>
                      )}
                      {discount.type === 'bulk' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Threshold:</span>
                            <span className="text-sm font-medium">{formatCurrency(discount.threshold)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Discount:</span>
                            <span className="text-sm font-medium">{discount.discount}%</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Uses:</span>
                        <span className="text-sm font-medium">{discount.uses}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-primary text-white py-2 px-4 rounded-md text-sm hover:bg-primary-dark">
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Discount Analytics</h3>
                <p className="text-gray-600">Track coupon performance and usage statistics</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <CreateCouponModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createCoupon}
        />
      )}
    </div>
  );
};

export default Discounts;