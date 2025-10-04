import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real payment data from API
  const [paymentData, setPaymentData] = useState({
    overview: {
      totalRevenue: 0,
      pendingPayments: 0,
      completedPayments: 0,
      refundedAmount: 0,
      totalTransactions: 0
    },
    gateways: [
      {
        id: 1,
        name: 'PayHere',
        status: 'active',
        transactions: 0,
        revenue: 0,
        fees: 2.8,
        isConnected: true
      },
      {
        id: 2,
        name: 'Stripe',
        status: 'active',
        transactions: 0,
        revenue: 0,
        fees: 3.2,
        isConnected: true
      }
    ],
    transactions: []
  });

  // Fetch payment data
  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch overview data
      const overviewResponse = await axios.get(API_ENDPOINTS.ADMIN_PAYMENTS_OVERVIEW, { headers });
      
      // Fetch transactions data
      const transactionsResponse = await axios.get(API_ENDPOINTS.ADMIN_PAYMENTS_TRANSACTIONS, { 
        headers,
        params: { status: filterStatus, search: searchTerm }
      });

      setPaymentData(prev => ({
        ...prev,
        overview: overviewResponse.data.overview,
        transactions: transactionsResponse.data.transactions || []
      }));
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to fetch payment data');
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when filters change
  useEffect(() => {
    if (!loading) {
      fetchPaymentData();
    }
  }, [filterStatus, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredTransactions = paymentData.transactions.filter(transaction => {
    const matchesSearch = transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
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
            onClick={fetchPaymentData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600">Manage payments, gateways, and financial transactions</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-outline flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export Report</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Gateway Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(paymentData.overview.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">↗ 12% from last month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(paymentData.overview.completedPayments)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(paymentData.overview.pendingPayments)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refunded Amount</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(paymentData.overview.refundedAmount)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <RefreshCw className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Transactions', icon: CreditCard },
                { id: 'gateways', name: 'Payment Gateways', icon: Settings },
                { id: 'refunds', name: 'Refunds', icon: RefreshCw },
                { id: 'reports', name: 'Revenue Reports', icon: TrendingUp }
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
                      placeholder="Search transactions..."
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
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                              <div className="text-sm text-gray-500">{transaction.orderId}</div>
                              <div className="text-xs text-gray-400">{transaction.date}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{transaction.customer}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                            <div className="text-xs text-gray-500">Fee: {formatCurrency(transaction.fees)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{transaction.gateway}</div>
                            <div className="text-xs text-gray-500">{transaction.method}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              {getStatusBadge(transaction.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-primary hover:text-primary-dark">
                              <Eye className="h-4 w-4" />
                            </button>
                            {transaction.status === 'completed' && (
                              <button className="text-red-600 hover:text-red-800">
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'gateways' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentData.gateways.map((gateway) => (
                  <div key={gateway.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{gateway.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        gateway.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {gateway.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transactions:</span>
                        <span className="text-sm font-medium">{gateway.transactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue:</span>
                        <span className="text-sm font-medium">{formatCurrency(gateway.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fee Rate:</span>
                        <span className="text-sm font-medium">{gateway.fees}%</span>
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

            {activeTab === 'refunds' && (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Refund Management</h3>
                <p className="text-gray-600">Process and track customer refunds</p>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Gross Revenue:</span>
                        <span className="text-sm font-medium">{formatCurrency(paymentData.overview.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Gateway Fees:</span>
                        <span className="text-sm font-medium text-red-600">-{formatCurrency(3500)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Refunds:</span>
                        <span className="text-sm font-medium text-red-600">-{formatCurrency(paymentData.overview.refundedAmount)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Net Revenue:</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(133000)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Transactions:</span>
                        <span className="text-sm font-medium">{paymentData.overview.totalTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Success Rate:</span>
                        <span className="text-sm font-medium text-green-600">94.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Refund Rate:</span>
                        <span className="text-sm font-medium">5.9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;