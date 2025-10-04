// API Configuration
export const API_BASE_URL = 'http://localhost:5001';


export const API_ENDPOINTS = {
  // Add this to your API_ENDPOINTS configuration
UPLOAD: `${API_BASE_URL}/api/upload`,
UPLOAD_IMAGE: `${API_BASE_URL}/api/upload`,
MEDIA_UPLOAD: `${API_BASE_URL}/api/media/upload`,

  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  ME: `${API_BASE_URL}/api/auth/me`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  FEATURED_PRODUCTS: `${API_BASE_URL}/api/products/featured`,
  RELATED_PRODUCTS: (id) => `${API_BASE_URL}/api/products/${id}/related`,
  PRODUCT_CATEGORIES: `${API_BASE_URL}/api/products/categories`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  
  // Contact endpoints
  CONTACT: `${API_BASE_URL}/api/contact`,
  
  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/products`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USERS_STATS: `${API_BASE_URL}/api/admin/users/stats`,
  ADMIN_CONTACTS: `${API_BASE_URL}/api/admin/contacts`,
  
  // Inventory endpoints
  ADMIN_INVENTORY_OVERVIEW: `${API_BASE_URL}/api/admin/inventory/overview`,
  ADMIN_INVENTORY_PRODUCTS: `${API_BASE_URL}/api/admin/inventory/products`,
  ADMIN_INVENTORY_UPDATE_STOCK: (id) => `${API_BASE_URL}/api/admin/inventory/products/${id}/stock`,
  
  // Supplier endpoints
  ADMIN_SUPPLIERS: `${API_BASE_URL}/api/admin/suppliers`,
  
  // Warehouse endpoints
  ADMIN_WAREHOUSES: `${API_BASE_URL}/api/admin/warehouses`,
  
  // Discount endpoints
  ADMIN_DISCOUNTS_OVERVIEW: `${API_BASE_URL}/api/admin/discounts/overview`,
  ADMIN_DISCOUNTS: `${API_BASE_URL}/api/admin/discounts`,
  
  // Payment endpoints
  ADMIN_PAYMENTS_OVERVIEW: `${API_BASE_URL}/api/admin/payments/overview`,
  ADMIN_PAYMENTS_TRANSACTIONS: `${API_BASE_URL}/api/admin/payments/transactions`,
  
  // Shipping endpoints
  ADMIN_SHIPPING_OVERVIEW: `${API_BASE_URL}/api/admin/shipping/overview`,
  ADMIN_SHIPPING_SHIPMENTS: `${API_BASE_URL}/api/admin/shipping/shipments`,
};
