import { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  Search, 
  Plus, 
  Edit3,
  Eye,
  CheckCircle,
  AlertTriangle,
  Settings,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Shipping = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real shipping data from API
  const [shippingData, setShippingData] = useState({
    overview: {
      totalShipments: 0,
      inTransit: 0,
      delivered: 0,
      pending: 0,
      averageDeliveryTime: 0
    },
    zones: [
      {
        id: 1,
        name: 'Colombo District',
        areas: ['Colombo 1-15', 'Mount Lavinia', 'Dehiwala'],
        rate: 350,
        deliveryTime: '1-2 days',
        status: 'active',
        orders: 0
      },
      {
        id: 2,
        name: 'Western Province',
        areas: ['Gampaha', 'Kalutara', 'Negombo'],
        rate: 450,
        deliveryTime: '2-3 days',
        status: 'active',
        orders: 0
      },
      {
        id: 3,
        name: 'Other Provinces',
        areas: ['Kandy', 'Galle', 'Matara', 'Jaffna'],
        rate: 650,
        deliveryTime: '3-5 days',
        status: 'active',
        orders: 0
      }
    ],
    couriers: [
      {
        id: 1,
        name: 'Pronto Express',
        contact: '+94 11 234 5678',
        email: 'support@pronto.lk',
        status: 'active',
        deliveries: 0,
        rating: 4.8,
        avgDeliveryTime: 2.1,
        coverage: 'Island wide'
      },
      {
        id: 2,
        name: 'Kapruka Delivery',
        contact: '+94 11 789 0123',
        email: 'delivery@kapruka.com',
        status: 'active',
        deliveries: 0,
        rating: 4.6,
        avgDeliveryTime: 2.5,
        coverage: 'Major cities'
      },
      {
        id: 3,
        name: 'Domex Express',
        contact: '+94 11 456 7890',
        email: 'info@domex.lk',
        status: 'active',
        deliveries: 0,
        rating: 4.4,
        avgDeliveryTime: 2.8,
        coverage: 'Western Province'
      }
    ],
    shipments: []
  });

  // Fetch shipping data
  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch overview data
      const overviewResponse = await axios.get(API_ENDPOINTS.ADMIN_SHIPPING_OVERVIEW, { headers });
      
      // Fetch shipments data
      const shipmentsResponse = await axios.get(API_ENDPOINTS.ADMIN_SHIPPING_SHIPMENTS, { 
        headers,
        params: { status: filterStatus, search: searchTerm }
      });

      setShippingData(prev => ({
        ...prev,
        overview: overviewResponse.data.overview,
        shipments: shipmentsResponse.data.shipments || []
      }));
    } catch (error) {
      console.error('Error fetching shipping data:', error);
      setError('Failed to fetch shipping data');
      toast.error('Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when filters change
  useEffect(() => {
    if (!loading) {
      fetchShippingData();
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
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: 'bg-green-100 text-green-800',
      in_transit: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const filteredShipments = shippingData.shipments.filter(shipment => {
    const matchesSearch = shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipping data...</p>
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
            onClick={fetchShippingData}
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
              <h1 className="text-3xl font-bold text-gray-900">Shipping & Delivery</h1>
              <p className="text-gray-600">Manage shipping zones, couriers, and track deliveries</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-outline flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Delivery Reports</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Shipping Zone</span>
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
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-3xl font-bold text-gray-900">{shippingData.overview.totalShipments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-blue-600">{shippingData.overview.inTransit}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{shippingData.overview.delivered}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{shippingData.overview.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
                <p className="text-3xl font-bold text-purple-600">{shippingData.overview.averageDeliveryTime}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Shipments', icon: Package },
                { id: 'zones', name: 'Shipping Zones', icon: MapPin },
                { id: 'couriers', name: 'Couriers', icon: Truck },
                { id: 'tracking', name: 'Track Shipments', icon: Eye }
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
                      placeholder="Search shipments..."
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
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Shipments Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredShipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                              <div className="text-sm text-gray-500">{shipment.orderId}</div>
                              <div className="text-xs text-gray-400">{shipment.trackingNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{shipment.customer}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{shipment.address}</div>
                            <div className="text-xs text-gray-500">Cost: {formatCurrency(shipment.cost)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{shipment.courier}</div>
                            <div className="text-xs text-gray-500">Shipped: {shipment.shippedDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(shipment.status)}
                              {getStatusBadge(shipment.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-primary hover:text-primary-dark">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'zones' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shippingData.zones.map((zone) => (
                  <div key={zone.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {zone.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Coverage Areas:</span>
                        <p className="text-sm text-gray-600">{zone.areas.join(', ')}</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shipping Rate:</span>
                        <span className="text-sm font-medium">{formatCurrency(zone.rate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Delivery Time:</span>
                        <span className="text-sm font-medium">{zone.deliveryTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Orders:</span>
                        <span className="text-sm font-medium">{zone.orders}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-primary text-white py-2 px-4 rounded-md text-sm hover:bg-primary-dark">
                        Edit Zone
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'couriers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shippingData.couriers.map((courier) => (
                  <div key={courier.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{courier.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        courier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {courier.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Contact:</span> {courier.contact}</p>
                      <p><span className="font-medium">Email:</span> {courier.email}</p>
                      <p><span className="font-medium">Deliveries:</span> {courier.deliveries}</p>
                      <p><span className="font-medium">Rating:</span> ⭐ {courier.rating}</p>
                      <p><span className="font-medium">Avg Delivery:</span> {courier.avgDeliveryTime} days</p>
                      <p><span className="font-medium">Coverage:</span> {courier.coverage}</p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-primary text-white py-2 px-4 rounded-md text-sm hover:bg-primary-dark">
                        View Details
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Shipment Tracking</h3>
                <p className="text-gray-600">Real-time tracking and delivery updates</p>
                <div className="mt-6">
                  <input
                    type="text"
                    placeholder="Enter tracking number..."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary mr-2"
                  />
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                    Track Shipment
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

export default Shipping;