import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Plus,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalContacts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.ADMIN_DASHBOARD);
      const data = response.data;
      const statistics = data.statistics || {};
      const totalRevenue = (data.recentSales || []).reduce((sum, d) => sum + (d.totalSales || 0), 0);
      setStats({
        totalProducts: statistics.totalProducts || 0,
        totalOrders: statistics.totalOrders || 0,
        totalUsers: statistics.totalUsers || 0,
        totalContacts: statistics.totalContacts || 0,
        pendingOrders: statistics.pendingOrders || 0,
        totalRevenue,
        recentOrders: (data.recentOrders || []).map(o => ({
          id: o._id,
          customer: o.user?.name || 'Customer',
          amount: o.total || 0,
          status: o.orderStatus || 'Pending',
          date: new Date(o.createdAt).toISOString().slice(0,10)
        })),
        topProducts: (data.topProducts || []).map(p => ({
          name: p.name,
          sales: p.totalSold,
          revenue: p.totalRevenue,
          mainImage: p.mainImage ? `${API_BASE_URL}${p.mainImage}` : null
        }))
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Simple SVG Line Chart for recent sales
  const SalesLineChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const width = 700; // responsive wrapper will clip
    const height = 220;
    const padding = 32;
    const values = data.map(d => d.totalSales || 0);
    const maxV = Math.max(...values, 1);
    const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
      const x = padding + i * xStep;
      const y = height - padding - (d.totalSales / maxV) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    // grid lines
    const gridY = [0.25, 0.5, 0.75, 1].map(f => height - padding - f * (height - padding * 2));

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
        {gridY.map((y, idx) => (
          <line key={idx} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
        ))}
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} />
        {data.map((d, i) => {
          const x = padding + i * xStep;
          const y = height - padding - (d.totalSales / maxV) * (height - padding * 2);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#3b82f6" />
              <title>{`${d._id}: ${formatCurrency(d.totalSales)} (${d.orderCount} orders)`}</title>
            </g>
          );
        })}
      </svg>
    );
  };

  // Simple SVG Bar Chart for top products revenue
  const TopProductsBarChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const width = 700;
    const barHeight = 28;
    const gap = 12;
    const padding = 16;
    const height = padding * 2 + data.length * (barHeight + gap) - gap;
    const maxV = Math.max(...data.map(d => d.revenue || 0), 1);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
        {data.map((d, i) => {
          const y = padding + i * (barHeight + gap);
          const w = ((d.revenue || 0) / maxV) * (width - padding * 2);
          return (
            <g key={i}>
              <rect x={padding} y={y} width={w} height={barHeight} rx="6" fill="#10b981" />
              <text x={padding + 8} y={y + barHeight / 2 + 4} fill="#fff" fontSize="12" fontWeight="600">{d.name}</text>
              <text x={padding + w - 8} y={y + barHeight / 2 + 4} fill="#064e3b" fontSize="12" textAnchor="end">{formatCurrency(d.revenue || 0)}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}!</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/products/new"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </Link>
              <Link
                to="/admin/settings"
                className="btn-outline flex items-center space-x-2"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/products" className="text-sm text-blue-600 hover:text-blue-800">
                View all products →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-orange-600">{stats.pendingOrders} pending</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/orders" className="text-sm text-green-600 hover:text-green-800">
                View all orders →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/users" className="text-sm text-purple-600 hover:text-purple-800">
                View all users →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/analytics" className="text-sm text-yellow-600 hover:text-yellow-800">
                View analytics →
              </Link>
            </div>
          </div>
        </div>

        {/* Sales Overview (Real Data Graph) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales (last 30 days)</h3>
              <p className="text-sm text-gray-600">Daily sales and order counts</p>
            </div>
            <div className="text-sm text-gray-600">Total: <span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span></div>
          </div>
          <div className="p-4 md:p-6">
            <SalesLineChart data={(stats.recentSales || []).map(d => ({ _id: d._id, totalSales: d.totalSales, orderCount: d.orderCount }))} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link to="/admin/orders" className="text-sm text-primary hover:text-primary-dark">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-600">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <Link to="/admin/products" className="text-sm text-primary hover:text-primary-dark">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <TopProductsBarChart data={stats.topProducts} />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/products/new"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
                <p className="text-gray-600">Create new product listing</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Orders</h3>
                <p className="text-gray-600">Process and track orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-gray-600">View and manage customers</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/contacts"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Forms</h3>
                <p className="text-gray-600">View customer inquiries</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View sales and performance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/settings"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">Configure your store</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
