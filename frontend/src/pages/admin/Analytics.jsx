import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ recentSales: [], topProducts: [], statistics: {} });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('sales');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dash, prods] = await Promise.all([
          axios.get(API_ENDPOINTS.ADMIN_DASHBOARD),
          axios.get(API_ENDPOINTS.PRODUCTS)
        ]);
        setData(dash.data || {});
        setProducts(Array.isArray(prods.data) ? prods.data : (prods.data.products || []));
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

  const SalesLineChart = ({ series }) => {
    if (!series || series.length === 0) return null;
    const width = 800, height = 260, pad = 36;
    const vals = series.map(d => d.totalSales || 0);
    const maxV = Math.max(...vals, 1);
    const step = (width - pad * 2) / Math.max(series.length - 1, 1);
    const points = series.map((d, i) => {
      const x = pad + i * step;
      const y = height - pad - (d.totalSales / maxV) * (height - pad * 2);
      return `${x},${y}`;
    }).join(' ');
    const gridY = [0.25, 0.5, 0.75, 1].map(f => height - pad - f * (height - pad * 2));
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
        {gridY.map((y, i) => (<line key={i} x1={pad} y1={y} x2={width-pad} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />))}
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} />
        {series.map((d, i) => {
          const x = pad + i * step;
          const y = height - pad - (d.totalSales / maxV) * (height - pad * 2);
          return (<g key={i}><circle cx={x} cy={y} r="3.5" fill="#3b82f6" /><title>{`${d._id}: ${formatCurrency(d.totalSales)} (${d.orderCount} orders)`}</title></g>);
        })}
      </svg>
    );
  };

  const TopProductsBarChart = ({ series }) => {
    if (!series || series.length === 0) return null;
    const width = 800, bar = 28, gap = 12, pad = 16, height = pad*2 + series.length*(bar+gap)-gap;
    const maxV = Math.max(...series.map(d => d.totalRevenue || 0), 1);
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <rect x="0" y="0" width={width} height={height} fill="#fff" />
        {series.map((d, i) => {
          const y = pad + i*(bar+gap);
          const w = ((d.totalRevenue||0)/maxV)*(width-pad*2);
          return (
            <g key={i}>
              <rect x={pad} y={y} width={w} height={bar} rx="6" fill="#10b981" />
              <text x={pad+8} y={y+bar/2+4} fill="#fff" fontSize="12" fontWeight="600">{d.name}</text>
              <text x={pad+w-8} y={y+bar/2+4} fill="#064e3b" fontSize="12" textAnchor="end">{formatCurrency(d.totalRevenue)}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Derived stock analytics
  const stockSummary = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
    const outOfStock = products.filter(p => (p.stock || 0) === 0);
    const byCategoryMap = new Map();
    products.forEach(p => {
      const key = p.category || 'Uncategorized';
      byCategoryMap.set(key, (byCategoryMap.get(key) || 0) + (p.stock || 0));
    });
    const byCategory = Array.from(byCategoryMap.entries()).map(([category, units]) => ({ category, units }));
    return { totalUnits, lowStock, outOfStock, byCategory };
  }, [products]);

  const StockByCategoryDonut = ({ series }) => {
    if (!series || series.length === 0) return null;
    const sorted = [...series].sort((a,b)=> (b.units||0) - (a.units||0));
    const top = sorted.slice(0, 6);
    const otherUnits = sorted.slice(6).reduce((s, it)=> s + (it.units||0), 0);
    const data = otherUnits > 0 ? [...top, { category: 'Other', units: otherUnits }] : top;
    const total = data.reduce((s, d)=> s + (d.units||0), 0) || 1;
    const size = 220; const radius = 90; const cx = size/2; const cy = size/2;
    const colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#a855f7','#94a3b8'];
    let cumulative = 0;
    const arcs = data.map((d, i) => {
      const value = d.units || 0;
      const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI/2;
      cumulative += value;
      const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI/2;
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
      return { path, color: colors[i % colors.length], label: d.category, value, percent: Math.round((value/total)*100) };
    });
    return (
      <div className="flex flex-col items-center md:flex-row md:items-start md:gap-6">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-56 h-56">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="26" />
          {arcs.map((a, i) => (
            <path key={i} d={a.path} stroke={a.color} strokeWidth="26" fill="none" />
          ))}
          <circle cx={cx} cy={cy} r={radius-18} fill="#fff" />
          <text x={cx} y={cy} textAnchor="middle" className="fill-gray-700" fontSize="14" fontWeight="600">Inventory</text>
          <text x={cx} y={cy+18} textAnchor="middle" className="fill-gray-500" fontSize="12">{total} units</text>
        </svg>
        <div className="grid grid-cols-2 gap-3 mt-4 md:mt-2">
          {arcs.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: a.color }} />
              <span className="truncate max-w-[8rem]" title={`${a.label}`}>{a.label}</span>
              <span className="ml-auto text-gray-600">{a.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600">Comprehensive business intelligence and performance insights</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="year">This year</option>
              </select>
              <button className="btn-outline flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency((data.recentSales || []).reduce((sum, d) => sum + (d.totalSales || 0), 0))}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(data.recentSales || []).reduce((sum, d) => sum + (d.orderCount || 0), 0)}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-gray-900">{data.statistics?.totalUsers || 0}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15.3% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(data.topProducts || []).reduce((sum, p) => sum + (p.totalSold || 0), 0)}
                </p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +6.7% from last month
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Sales Overview', icon: BarChart3 },
                { id: 'products', name: 'Product Reports', icon: Package },
                { id: 'customers', name: 'Customer Analysis', icon: Users },
                { id: 'profitloss', name: 'Profit & Loss', icon: DollarSign },
                { id: 'inventory', name: 'Inventory Insights', icon: TrendingUp }
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
              <div className="space-y-8">
                {/* Sales Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 30 days)</h3>
                  <SalesLineChart series={data.recentSales || []} />
                </div>

                {/* Top Products */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                  <TopProductsBarChart series={data.topProducts || []} />
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Best Sellers</h4>
                    <div className="space-y-2">
                      {(data.topProducts || []).slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{product.name}</span>
                          <span className="font-medium">{product.totalSold || 0} sold</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Revenue Leaders</h4>
                    <div className="space-y-2">
                      {(data.topProducts || []).slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{product.name}</span>
                          <span className="font-medium">{formatCurrency(product.totalRevenue || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Category Performance</h4>
                    <div className="space-y-2">
                      {stockSummary.byCategory.slice(0, 5).map((cat, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{cat.category}</span>
                          <span className="font-medium">{cat.units} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance Analysis</h3>
                  <TopProductsBarChart series={data.topProducts || []} />
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Segments</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New Customers:</span>
                        <span className="text-sm font-medium">156 (23%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Returning:</span>
                        <span className="text-sm font-medium">423 (62%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">VIP Customers:</span>
                        <span className="text-sm font-medium">98 (15%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Lifetime Value</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average CLV:</span>
                        <span className="text-sm font-medium">{formatCurrency(12500)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Top 10% CLV:</span>
                        <span className="text-sm font-medium">{formatCurrency(45000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Order Value:</span>
                        <span className="text-sm font-medium">{formatCurrency(2350)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Purchase Behavior</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Repeat Rate:</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Order Freq:</span>
                        <span className="text-sm font-medium">2.3/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cart Abandon:</span>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profitloss' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Revenue Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Gross Revenue:</span>
                        <span className="text-sm font-medium">{formatCurrency(156000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discounts:</span>
                        <span className="text-sm font-medium text-red-600">-{formatCurrency(8500)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Refunds:</span>
                        <span className="text-sm font-medium text-red-600">-{formatCurrency(3200)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Net Revenue:</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(144300)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Cost Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cost of Goods:</span>
                        <span className="text-sm font-medium">{formatCurrency(89000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shipping Costs:</span>
                        <span className="text-sm font-medium">{formatCurrency(12500)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Fees:</span>
                        <span className="text-sm font-medium">{formatCurrency(4300)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Gross Profit:</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(38500)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Profit Margin Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">26.7%</div>
                      <div className="text-sm text-gray-600">Gross Margin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">18.2%</div>
                      <div className="text-sm text-gray-600">Net Margin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(2350)}</div>
                      <div className="text-sm text-gray-600">Avg Order Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">94.2%</div>
                      <div className="text-sm text-gray-600">Customer Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-8">
                {/* Stock Analytics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="text-sm text-indigo-800">Total Units</div>
                      <div className="text-2xl font-bold text-indigo-900">{stockSummary.totalUnits}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-sm text-yellow-800">Low Stock (≤5)</div>
                      <div className="text-2xl font-bold text-yellow-900">{stockSummary.lowStock.length}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-sm text-red-800">Out of Stock</div>
                      <div className="text-2xl font-bold text-red-900">{stockSummary.outOfStock.length}</div>
                    </div>
                  </div>
                  <div className="max-w-3xl">
                    <StockByCategoryDonut series={stockSummary.byCategory} />
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Low Stock Items ({stockSummary.lowStock.length})</h4>
                    <div className="space-y-2">
                      {stockSummary.lowStock.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-yellow-700">{product.name}</span>
                          <span className="font-medium text-yellow-800">{product.stock} left</span>
                        </div>
                      ))}
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

export default Analytics;


