# Baby Kingdom - Complete E-commerce Website

A full-stack MERN e-commerce website for Baby Kingdom, a baby product shop located in Bandarawela, Sri Lanka.

## 🏗️ Project Overview

Baby Kingdom is a comprehensive e-commerce platform designed specifically for baby products. The website features a modern, baby-friendly design with pastel colors, rounded corners, and a responsive layout that works seamlessly across all devices.

## 🌟 Features

### Customer Features
- **User Authentication**: Secure registration and login system
- **Product Browsing**: Browse products by category with search and filtering
- **Shopping Cart**: Add products to cart with quantity management
- **Order Management**: Place orders and track order history
- **User Profile**: Manage personal information and addresses
- **Responsive Design**: Mobile-first approach for all devices

### Admin Features
- **Dashboard**: Overview of sales, orders, and user statistics
- **Product Management**: Add, edit, and delete products with image uploads
- **Order Management**: Process orders and update status
- **User Management**: View and manage customer accounts
- **Contact Management**: Handle customer inquiries and support requests

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **File Uploads**: Image upload support for products
- **Search & Filtering**: Advanced product search and category filtering
- **Responsive UI**: Modern design with TailwindCSS
- **Real-time Updates**: Live cart and order updates

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Password Hashing**: bcryptjs
- **Validation**: Built-in validation with error handling

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS with custom baby theme
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Toastify

## 📁 Project Structure

```
baby-kingdom/
├── backend/                 # Node.js + Express backend
│   ├── models/             # Database models (User, Product, Order, Contact)
│   ├── routes/             # API route handlers
│   ├── middleware/         # Authentication and upload middleware
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seeding script
│   └── README.md           # Backend documentation
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── pages/          # Page components
│   │   └── ...
│   ├── tailwind.config.js  # TailwindCSS configuration
│   └── README.md           # Frontend documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn package manager

### 1. Clone and Setup
```bash
git clone <repository-url>
cd baby-kingdom
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (see backend README for details)
# Start MongoDB service
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Login**: admin@babykingdom.lk / admin123

## 📊 Database Models

### User
- Customer and admin users
- Password hashing with bcrypt
- Role-based access control
- Profile information and addresses

### Product
- Product details with images
- Category and age group classification
- Stock management
- Featured product support
- Search indexing

### Order
- Order items with quantities
- Shipping address and payment details
- Order status tracking
- Stock management integration

### Contact
- Contact form submissions
- Status tracking for admin management

## 🔐 Authentication & Security

- **JWT Tokens**: Secure authentication with token expiration
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Separate customer and admin permissions
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Secure cross-origin requests

## 🎨 Design & Theme

### Color Palette
- **Primary**: Baby Pink (#FFB6C1)
- **Secondary**: Sky Blue (#87CEEB)
- **Accent**: Warm Cream (#FFF8DC)
- **Supporting**: Soft Pink, Baby Blue, Warm Cream

### Design Principles
- **Baby-friendly**: Soft, welcoming colors and rounded corners
- **Responsive**: Mobile-first design approach
- **Accessible**: High contrast and readable typography
- **Modern**: Clean, minimalist interface design

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: Single column layouts, collapsible navigation
- **Tablet**: Two-column grids, expanded navigation
- **Desktop**: Multi-column layouts, full navigation

## 🔧 Configuration

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/baby-kingdom
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
```

## 📈 API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `POST /api/contact` - Submit contact form

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Protected Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `PUT /api/auth/profile` - Update profile

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin statistics
- `POST /api/admin/products` - Create product
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/users` - Get all users

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure MongoDB Atlas or production MongoDB
4. Set up file upload to cloud storage

### Frontend Deployment
1. Build production version: `npm run build`
2. Deploy `dist` folder to hosting service
3. Configure environment variables for production API

### Recommended Hosting
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Frontend**: Vercel, Netlify, AWS S3
- **Database**: MongoDB Atlas, AWS DocumentDB

## 🧪 Testing

### Backend Testing
- API endpoints with Postman or similar tools
- Database operations and validation
- Authentication and authorization
- File upload functionality

### Frontend Testing
- User interface responsiveness
- Authentication flows
- Shopping cart functionality
- Cross-browser compatibility

## 📚 Documentation

- **Backend**: See `backend/README.md` for detailed API documentation
- **Frontend**: See `frontend/README.md` for component and styling guides
- **API**: Use tools like Postman to explore endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code style and patterns
4. Add proper error handling and validation
5. Test thoroughly before submitting
6. Update documentation as needed

## 📄 License

This project is part of the Baby Kingdom e-commerce website.

## 🆘 Support

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Port Conflicts**: Check if ports 5000 (backend) and 5173 (frontend) are available
3. **Dependencies**: Ensure all npm packages are properly installed
4. **Environment Variables**: Verify .env files are configured correctly

### Getting Help
- Check the respective README files for detailed setup instructions
- Review browser console and server logs for error messages
- Ensure all prerequisites are met
- Verify network connectivity and firewall settings

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic e-commerce functionality
- ✅ User authentication system
- ✅ Product management
- ✅ Order processing
- ✅ Admin dashboard

### Phase 2 (Future)
- 🔄 Payment gateway integration (Stripe/PayPal)
- 🔄 Email notifications
- 🔄 Advanced search and filtering
- 🔄 Product reviews and ratings
- 🔄 Wishlist functionality

### Phase 3 (Future)
- 🔄 Mobile app development
- 🔄 Advanced analytics
- 🔄 Multi-language support
- 🔄 Advanced inventory management
- 🔄 Customer loyalty program

---

**Baby Kingdom** - Making parenting easier, one product at a time! 👶👑
