# Baby Kingdom Frontend

A modern, responsive React frontend for the Baby Kingdom e-commerce website, built with Vite, TailwindCSS, and React Router.

## Features

- **Modern Design**: Beautiful, baby-friendly theme with pastel colors and rounded corners
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Authentication**: Complete user registration, login, and profile management
- **Product Browsing**: Shop page with product grid and filtering
- **Shopping Cart**: Local cart management with persistent storage
- **User Dashboard**: Customer profile and order management
- **Admin Panel**: Comprehensive admin interface for product and user management
- **Contact System**: Contact form with WhatsApp integration
- **Search & Navigation**: Advanced search and category-based navigation

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS with custom baby theme
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **UI Components**: Custom components with TailwindCSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend server running (see backend README)

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd baby-kingdom/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   └── layout/         # Layout components (Header, Footer)
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.jsx # Authentication state management
│   │   └── CartContext.jsx # Shopping cart state management
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin panel pages
│   │   ├── Home.jsx        # Home page
│   │   ├── Shop.jsx        # Product shop page
│   │   ├── Login.jsx       # User login page
│   │   ├── Register.jsx    # User registration page
│   │   ├── About.jsx       # About us page
│   │   └── Contact.jsx     # Contact page
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # App entry point
│   ├── index.css           # Global styles and TailwindCSS
│   └── ...
├── public/                  # Static assets
├── tailwind.config.js      # TailwindCSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Key Components

### Authentication System
- **AuthContext**: Manages user authentication state
- **ProtectedRoute**: Guards routes requiring authentication
- **AdminRoute**: Guards admin-only routes
- **Login/Register**: User authentication forms

### Shopping Cart
- **CartContext**: Manages cart state with localStorage persistence
- **Cart functionality**: Add, remove, update quantities
- **Cart calculations**: Subtotal, shipping, tax, total

### Layout Components
- **Header**: Navigation, search, user menu, cart
- **Footer**: Company info, links, contact details
- **Responsive design**: Mobile-first approach

### Pages
- **Home**: Hero section, featured products, categories
- **Shop**: Product grid with filtering and search
- **About**: Company information and location
- **Contact**: Contact form and information

## Customization

### Colors & Theme
The baby-friendly theme uses custom colors defined in `tailwind.config.js`:

```javascript
colors: {
  'baby-pink': '#FFB6C1',
  'baby-blue': '#87CEEB',
  'baby-cream': '#FFF8DC',
  'soft-pink': '#FFC0CB',
  'sky-blue': '#87CEEB',
  'warm-cream': '#F5F5DC',
  'primary': '#FFB6C1',
  'secondary': '#87CEEB',
  'accent': '#FFF8DC',
}
```

### Styling Classes
Custom utility classes are defined in `src/index.css`:

- `.btn-primary` - Primary button styling
- `.btn-secondary` - Secondary button styling
- `.btn-outline` - Outline button styling
- `.card` - Product card styling
- `.input-field` - Form input styling
- `.section-padding` - Section spacing
- `.container-custom` - Container constraints

## API Integration

The frontend communicates with the backend API at `http://localhost:5000`. Key endpoints:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Orders**: `/api/orders/*`
- **Contact**: `/api/contact`
- **Admin**: `/api/admin/*`

## State Management

### Context Providers
- **AuthContext**: User authentication, profile, admin status
- **CartContext**: Shopping cart items, totals, operations

### Local Storage
- **Authentication tokens**: JWT tokens for API calls
- **Cart data**: Persistent shopping cart across sessions

## Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Single column layouts, collapsible navigation
- **Tablet**: Two-column grids, expanded navigation
- **Desktop**: Multi-column layouts, full navigation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation if needed

### Adding New Components
1. Create component in `src/components/`
2. Import and use in pages
3. Add to exports if reusable

### Styling Guidelines
- Use TailwindCSS utility classes
- Create custom classes in `src/index.css` for repeated patterns
- Follow the baby theme color palette
- Ensure responsive design

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop `dist` folder
- **AWS S3**: Upload `dist` folder to S3 bucket
- **Traditional hosting**: Upload `dist` folder to web server

### Environment Variables
Create `.env` file for production:
```env
VITE_API_URL=https://your-backend-domain.com
```

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend server is running
   - Check API URL in axios calls
   - Verify CORS configuration

2. **Authentication Issues**
   - Clear localStorage and try again
   - Check JWT token expiration
   - Verify backend authentication

3. **Styling Issues**
   - Ensure TailwindCSS is properly configured
   - Check custom CSS imports
   - Verify PostCSS configuration

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Use Network tab to debug API calls
- Test responsive design in browser dev tools

## Contributing

1. Follow the existing code structure
2. Use consistent naming conventions
3. Add proper error handling
4. Test responsive design
5. Update documentation

## License

This project is part of the Baby Kingdom e-commerce website.

## Support

For technical support or questions:
- Check the backend README for API documentation
- Review browser console for error messages
- Ensure all dependencies are properly installed
- Verify backend server is running and accessible
