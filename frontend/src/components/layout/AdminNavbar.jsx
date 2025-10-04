import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  User, 
  LogOut,
  CreditCard,
  Truck,
  Tag,
  Warehouse,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const items = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Inventory', href: '/admin/inventory', icon: Warehouse },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Shipping', href: '/admin/shipping', icon: Truck },
    { name: 'Discounts', href: '/admin/discounts', icon: Tag },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="container-custom h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-full" />
          <span className="text-xl md:text-2xl font-bold text-gray-900">Admin Panel</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {/* Show fewer items on smaller screens */}
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-4 h-4" /> 
              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          ))}
          
          {/* More items dropdown for remaining items */}
          {items.length > 6 && (
            <div className="relative group">
              <button className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100">
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">More</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {items.slice(6).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Always visible logout button */}
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors ml-2"
            onClick={() => { logout(); navigate('/'); }}
          >
            <LogOut className="w-4 h-4" /> 
            <span className="hidden sm:inline">Logout</span>
          </button>
          
          {/* Profile button */}
          <button
            className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 ml-1"
            onClick={() => navigate('/admin/profile')}
          >
            <User className="w-4 h-4" /> 
            <span className="hidden lg:inline">{user?.name || 'Admin'}</span>
          </button>
        </div>
        {/* Mobile: compact links with scrollable navigation */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto max-w-full">
          {/* Essential navigation items only */}
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`p-2 rounded-lg flex-shrink-0 ${
                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label={item.name}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
          
          {/* Always visible logout button on mobile */}
          <button
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex-shrink-0 ml-1"
            aria-label="Logout"
            title="Logout"
            onClick={() => { logout(); navigate('/'); }}
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          {/* Profile button */}
          <button
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Profile"
            title="Profile"
            onClick={() => navigate('/admin/profile')}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;


