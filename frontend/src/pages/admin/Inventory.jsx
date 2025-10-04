import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Edit3,
  Eye,
  Building2,
  Truck,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from API
  const [inventoryData, setInventoryData] = useState({
    overview: {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalValue: 0,
      lowStockThreshold: 10
    },
    products: [],
    suppliers: [],
    warehouses: []
  });

  // Fetch inventory data
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch overview data
      const overviewResponse = await axios.get(API_ENDPOINTS.ADMIN_INVENTORY_OVERVIEW, { headers });
      
      // Fetch products data
      const productsResponse = await axios.get(API_ENDPOINTS.ADMIN_INVENTORY_PRODUCTS, { 
        headers,
        params: { status: filterStatus, search: searchTerm }
      });
      
      // Fetch suppliers data
      const suppliersResponse = await axios.get(API_ENDPOINTS.ADMIN_SUPPLIERS, { headers });
      
      // Fetch warehouses data
      const warehousesResponse = await axios.get(API_ENDPOINTS.ADMIN_WAREHOUSES, { headers });

      setInventoryData({
        overview: overviewResponse.data.overview,
        products: productsResponse.data.products || [],
        suppliers: suppliersResponse.data.suppliers || [],
        warehouses: warehousesResponse.data.warehouses || []
      });
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError('Failed to fetch inventory data');
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when filters change
  useEffect(() => {
    if (!loading) {
      fetchInventoryData();
    }
  }, [filterStatus, searchTerm]);

  const updateStock = async (productId, newStock, reason) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(
        API_ENDPOINTS.ADMIN_INVENTORY_UPDATE_STOCK(productId),
        { stock: newStock, reason },
        { headers }
      );
      
      toast.success('Stock updated successfully');
      fetchInventoryData(); // Refresh data
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const getStatusBadge = (status, currentStock, minStock) => {
    if (status === 'out' || currentStock === 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Out of Stock</span>;
    } else if (status === 'low' || currentStock <= minStock) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">In Stock</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const filteredProducts = inventoryData.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const StockUpdateModal = ({ product, onClose, onUpdate }) => {
    const [newStock, setNewStock] = useState(product?.currentStock || 0);
    const [reason, setReason] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
      if (!reason) {
        toast.error('Please select a reason for the stock update');
        return;
      }
      
      setUpdating(true);
      try {
        await updateStock(product.id, newStock, reason);
        onUpdate(product.id, newStock, reason);
        onClose();
      } catch (error) {
        console.error('Failed to update stock:', error);
      } finally {
        setUpdating(false);
      }
    };

    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Update Stock - {product.name}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
              <p className="text-2xl font-bold text-gray-900">{product.currentStock}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Stock Level</label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select reason</option>
                <option value="restock">New Stock Arrival</option>
                <option value="sale">Sales Adjustment</option>
                <option value="damage">Damaged Items</option>
                <option value="return">Customer Return</option>
                <option value="audit">Stock Audit</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
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
            onClick={fetchInventoryData}
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Monitor stock levels, suppliers, and warehouse operations</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
              <button
                onClick={() => setShowSupplierModal(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Building2 className="h-5 w-5" />
                <span>Add Supplier</span>
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
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{inventoryData.overview.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-yellow-600">{inventoryData.overview.lowStockProducts}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{inventoryData.overview.outOfStockProducts}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(inventoryData.overview.totalValue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Stock Overview', icon: Package },
                { id: 'suppliers', name: 'Suppliers', icon: Building2 },
                { id: 'warehouses', name: 'Warehouses', icon: Truck },
                { id: 'alerts', name: 'Stock Alerts', icon: AlertTriangle }
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
                      placeholder="Search products..."
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
                    <option value="good">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">{product.currentStock}</span> / {product.maxStock}
                            </div>
                            <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(product.totalValue)}</div>
                            <div className="text-xs text-gray-500">Unit: {formatCurrency(product.unitPrice)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.supplier}</div>
                            <div className="text-xs text-gray-500">{product.warehouse}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(product.status, product.currentStock, product.minStock)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="text-primary hover:text-primary-dark"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventoryData.suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Contact:</span> {supplier.contact}</p>
                      <p><span className="font-medium">Email:</span> {supplier.email}</p>
                      <p><span className="font-medium">Phone:</span> {supplier.phone}</p>
                      <p><span className="font-medium">Products:</span> {supplier.products}</p>
                      <p><span className="font-medium">Rating:</span> ⭐ {supplier.rating}</p>
                      <p><span className="font-medium">Last Order:</span> {supplier.lastOrder}</p>
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

            {activeTab === 'warehouses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventoryData.warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{warehouse.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm font-medium">{warehouse.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Manager:</span>
                        <span className="text-sm font-medium">{warehouse.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Contact:</span>
                        <span className="text-sm font-medium">{warehouse.contact}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Capacity Usage:</span>
                          <span className="font-medium">{Math.round((warehouse.occupied / warehouse.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(warehouse.occupied / warehouse.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{warehouse.occupied.toLocaleString()} used</span>
                          <span>{warehouse.capacity.toLocaleString()} total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Out of Stock (3 items)</h3>
                  <div className="space-y-2">
                    {inventoryData.products.filter(p => p.currentStock === 0).map(product => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-red-700">{product.name} (SKU: {product.sku})</span>
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                          Reorder
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Low Stock Alert ({inventoryData.overview.lowStockProducts} items)</h3>
                  <div className="space-y-2">
                    {inventoryData.products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0).map(product => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-yellow-700">{product.name} - {product.currentStock} left</span>
                        <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Update Modal */}
      {selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={(id, newStock, reason) => {
            // Update the inventory data
            setInventoryData(prev => ({
              ...prev,
              products: prev.products.map(p => 
                p.id === id ? { ...p, currentStock: newStock } : p
              )
            }));
          }}
        />
      )}
    </div>
  );
};

export default Inventory;