import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut,
  Crown,
  Package,
  Users,
  MessageSquare,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const shopDropdownRef = useRef(null);

  // Categories for the dropdown
  const categories = ['Baby Clothing', 'Accessories', 'Gift', 'Toys', 'Care Products'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target)) {
        setIsShopDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    let cancelToken;
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        if (typeof axios.CancelToken !== 'undefined') {
          if (cancelToken) cancelToken.cancel();
          cancelToken = axios.CancelToken.source();
        }
        const res = await axios.get(API_ENDPOINTS.PRODUCTS);
        const all = res.data || [];
        const q = searchQuery.toLowerCase();
        const filtered = all.filter(p => 
          p.name?.toLowerCase().includes(q) || 
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some(tag => tag.toLowerCase().includes(q))
        ).slice(0, 8);
        setSuggestions(filtered);
      } catch (err) {
        // ignore
      }
    };
    const t = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
    setIsShopDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
  ];

  return (
    <header className={`bg-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-md'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gradient">Baby Kingdom</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 mx-4">
            {navigation.map((item) => {
              if (item.name === 'Shop') {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    ref={shopDropdownRef}
                    onMouseEnter={() => setIsShopDropdownOpen(true)}
                    onMouseLeave={() => setIsShopDropdownOpen(false)}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center px-2 py-1 text-gray-700 hover:text-primary transition-colors duration-300 font-medium rounded-md ${
                        isActive(item.href) ? 'text-primary bg-primary/10' : 'hover:bg-gray-100'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Link>
                    
                    {/* Dropdown Menu */}
                    {isShopDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <Link
                          to="/shop"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                          onClick={() => setIsShopDropdownOpen(false)}
                        >
                          All Products
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-2 py-1 text-gray-700 hover:text-primary transition-colors duration-300 font-medium rounded-md ${
                    isActive(item.href) ? 'text-primary bg-primary/10' : 'hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search for baby products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                className="w-full pl-4 pr-12 py-2 border-2 border-gray-200 rounded-full focus:border-primary focus:outline-none transition-colors duration-300 focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white p-1.5 rounded-full transition-colors duration-300"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                  {suggestions.map(s => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => { navigate(`/products/${s._id}`); setShowSuggestions(false); setSearchQuery(''); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-gray-500 truncate">{s.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors duration-300 rounded-full hover:bg-gray-100"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary transition-colors duration-300 rounded-full hover:bg-gray-100"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="hidden lg:block font-medium truncate max-w-[120px]">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Customer Menu */}
                    {!isAdmin() && (
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-4 h-4 mr-3" />
                          <span>My Orders</span>
                        </Link>
                      </div>
                    )}

                    {/* Admin Menu */}
                    {isAdmin() && (
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Admin
                        </div>
                        {adminNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-primary border border-primary rounded-full hover:bg-primary/90 transition-colors duration-300"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-300 rounded-full hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4 px-2">
              <input
                type="text"
                placeholder="Search for baby products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors duration-300 focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white p-1.5 rounded-full transition-colors duration-300"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                if (item.name === 'Shop') {
                  return (
                    <div key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center justify-between px-4 py-3 text-gray-700 rounded-xl transition-colors duration-300 font-medium ${
                          isActive(item.href) ? 'bg-primary text-white' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                        <span className="text-xs text-gray-500">All Products</span>
                      </Link>
                      {/* Mobile Category Links */}
                      <div className="ml-4 mt-1 space-y-1">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              handleCategoryClick(category);
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-xl transition-colors duration-300 font-medium ${
                      isActive(item.href) ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile User Links for logged in users */}
              {user && !isAdmin() && (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-xl transition-colors duration-300 font-medium hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 text-gray-700 rounded-xl transition-colors duration-300 font-medium hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                </>
              )}
              
              {/* Mobile Admin Links */}
              {user && isAdmin() && (
                <>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Admin
                  </div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl transition-colors duration-300 font-medium hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </>
              )}
              
              {/* Mobile Auth Links for logged out users */}
              {!user && (
                <div className="flex space-x-2 pt-2 px-4">
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2 text-primary border border-primary rounded-full font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2 text-white bg-primary border border-primary rounded-full font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
              
              {/* Logout in mobile menu */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-600 rounded-xl transition-colors duration-300 font-medium hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;