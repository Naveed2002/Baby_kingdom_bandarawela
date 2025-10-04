# Baby Kingdom Backend

A complete Node.js backend for the Baby Kingdom e-commerce website, built with Express.js and MongoDB.

## Features

- **User Authentication**: JWT-based authentication for customers and admins
- **Product Management**: CRUD operations for baby products with image uploads
- **Order Management**: Complete order processing and tracking
- **User Management**: Customer and admin user management
- **Contact Form**: Contact form submission handling
- **Admin Dashboard**: Comprehensive admin panel with statistics
- **File Uploads**: Image upload support for products
- **Search & Filtering**: Advanced product search and filtering
- **Pagination**: Efficient data pagination for large datasets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Password Hashing**: bcryptjs
- **Validation**: Built-in validation with error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd baby-kingdom/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/baby-kingdom
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

5. **Seed the Database (Optional)**
   ```bash
   node seed.js
   ```
   This will create:
   - Admin user: `admin@babykingdom.lk` / `admin123`
   - Sample products for testing

6. **Start the Server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products (Public)
- `GET /api/products` - Get all products with filters
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:id` - Get single product

### Products (Admin Only)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create new order (checkout)
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

### Orders (Admin Only)
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status

### Contact
- `POST /api/contact` - Submit contact form

### Contact (Admin Only)
- `GET /api/contact` - Get all contact submissions
- `GET /api/contact/:id` - Get contact details
- `PUT /api/contact/:id/status` - Update contact status
- `DELETE /api/contact/:id` - Delete contact

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users` - Create new user

## Database Models

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

## File Uploads

- **Location**: `/uploads/` directory
- **Supported Formats**: Images (JPG, PNG, GIF, etc.)
- **File Size Limit**: 5MB per file
- **Multiple Files**: Up to 5 images per product
- **Storage**: Local file system (can be configured for cloud storage)

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive information exposure

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seed.js` - Seed database with sample data

### File Structure
```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── uploads/         # File upload directory
├── server.js        # Main server file
├── seed.js          # Database seeding script
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/baby-kingdom` |
| `JWT_SECRET` | Secret key for JWT tokens | `fallback-secret` |
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## Testing the API

You can test the API endpoints using tools like:
- **Postman**
- **Insomnia**
- **cURL**
- **Thunder Client (VS Code extension)**

### Example API Calls

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "0712345678"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Deployment

### Production Considerations
1. Change `JWT_SECRET` to a strong, unique key
2. Use environment-specific MongoDB connection strings
3. Configure proper CORS settings for production domain
4. Set up file upload to cloud storage (AWS S3, Cloudinary, etc.)
5. Implement rate limiting and additional security measures
6. Use PM2 or similar process manager for production

### Environment Setup
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baby-kingdom
JWT_SECRET=your-production-secret-key-here
PORT=5000
NODE_ENV=production
```

## Support

For any issues or questions:
- Check the error logs in the console
- Verify MongoDB connection
- Ensure all environment variables are set
- Check file permissions for uploads directory

## License

This project is part of the Baby Kingdom e-commerce website.
