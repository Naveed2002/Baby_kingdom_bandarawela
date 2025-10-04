import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminNavbar from './components/layout/AdminNavbar';

// Page Components
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminContacts from './pages/admin/Contacts';
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/Settings';
import AdminAnalytics from './pages/admin/Analytics';
import AdminCustomers from './pages/admin/Customers';
import AdminInventory from './pages/admin/Inventory';
import AdminPayments from './pages/admin/Payments';
import AdminShipping from './pages/admin/Shipping';
import AdminDiscounts from './pages/admin/Discounts';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdminRoute ? <AdminNavbar /> : <Header />}
      <main className={"pt-20"}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                
                {/* Protected Customer Routes */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />
                <Route path="/admin/products/new" element={
                  <AdminRoute>
                    <ProductForm />
                  </AdminRoute>
                } />
                <Route path="/admin/products/add" element={
                  <AdminRoute>
                    <ProductForm />
                  </AdminRoute>
                } />
                <Route path="/admin/products/:id/edit" element={
                  <AdminRoute>
                    <ProductForm />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                } />
                <Route path="/admin/analytics" element={
                  <AdminRoute>
                    <AdminAnalytics />
                  </AdminRoute>
                } />
                <Route path="/admin/profile" element={
                  <AdminRoute>
                    <AdminProfile />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/contacts" element={
                  <AdminRoute>
                    <AdminContacts />
                  </AdminRoute>
                } />
                <Route path="/admin/customers" element={
                  <AdminRoute>
                    <AdminCustomers />
                  </AdminRoute>
                } />
                <Route path="/admin/inventory" element={
                  <AdminRoute>
                    <AdminInventory />
                  </AdminRoute>
                } />
                <Route path="/admin/payments" element={
                  <AdminRoute>
                    <AdminPayments />
                  </AdminRoute>
                } />
                <Route path="/admin/shipping" element={
                  <AdminRoute>
                    <AdminShipping />
                  </AdminRoute>
                } />
                <Route path="/admin/discounts" element={
                  <AdminRoute>
                    <AdminDiscounts />
                  </AdminRoute>
                } />
              </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
