const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

// MongoDB connection with your password
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nawaznaveed8279:Sanasana2004@bk.z3rkn0l.mongodb.net/baby-kingdom?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('Connected to MongoDB Atlas for seeding');
  seedDatabase();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample products data
const sampleProducts = [
  {
    name: "Organic Cotton Baby Onesie",
    category: "Clothes",
    description: "Soft, breathable organic cotton onesie perfect for newborns. Features snap buttons for easy diaper changes and gentle elastic for comfort.",
    price: 2500,
    originalPrice: 3000,
    stock: 50,
    images: ["/uploads/onesie-1.jpg", "/uploads/onesie-2.jpg"],
    mainImage: "/uploads/onesie-1.jpg",
    brand: "Baby Comfort",
    ageGroup: "0-3 months",
    isFeatured: true,
    tags: ["organic", "cotton", "newborn", "comfortable"],
    dimensions: { length: 50, width: 30, height: 2, unit: "cm" },
    weight: { value: 100, unit: "g" }
  },
  {
    name: "Educational Wooden Blocks Set",
    category: "Toys",
    description: "Colorful wooden building blocks that help develop motor skills and creativity. Made from safe, non-toxic materials.",
    price: 3500,
    originalPrice: 4000,
    stock: 30,
    images: ["/uploads/blocks-1.jpg", "/uploads/blocks-2.jpg"],
    mainImage: "/uploads/blocks-1.jpg",
    brand: "Smart Toys",
    ageGroup: "2-4 years",
    isFeatured: true,
    tags: ["educational", "wooden", "creative", "safe"],
    dimensions: { length: 25, width: 15, height: 8, unit: "cm" },
    weight: { value: 800, unit: "g" }
  },
  {
    name: "Baby Care Gift Basket",
    category: "Gift Items",
    description: "Complete baby care package including lotion, shampoo, wipes, and other essentials. Perfect gift for new parents.",
    price: 4500,
    originalPrice: 5500,
    stock: 20,
    images: ["/uploads/gift-basket-1.jpg"],
    mainImage: "/uploads/gift-basket-1.jpg",
    brand: "Baby Care Plus",
    ageGroup: "All ages",
    isFeatured: true,
    tags: ["gift", "care", "essential", "new parents"],
    dimensions: { length: 30, width: 20, height: 15, unit: "cm" },
    weight: { value: 1200, unit: "g" }
  },
  {
    name: "Adjustable Baby Carrier",
    category: "Accessories",
    description: "Ergonomic baby carrier with adjustable straps and multiple carrying positions. Supports baby's natural spine development.",
    price: 6500,
    originalPrice: 7500,
    stock: 25,
    images: ["/uploads/carrier-1.jpg", "/uploads/carrier-2.jpg"],
    mainImage: "/uploads/carrier-1.jpg",
    brand: "Comfort Carry",
    ageGroup: "0-24 months",
    isFeatured: false,
    tags: ["ergonomic", "adjustable", "comfortable", "portable"],
    dimensions: { length: 40, width: 25, height: 5, unit: "cm" },
    weight: { value: 600, unit: "g" }
  },
  {
    name: "Natural Baby Shampoo",
    category: "Care Products",
    description: "Gentle, tear-free baby shampoo made with natural ingredients. Hypoallergenic and suitable for sensitive skin.",
    price: 1800,
    originalPrice: 2200,
    stock: 40,
    images: ["/uploads/shampoo-1.jpg"],
    mainImage: "/uploads/shampoo-1.jpg",
    brand: "Natural Care",
    ageGroup: "All ages",
    isFeatured: false,
    tags: ["natural", "tear-free", "hypoallergenic", "sensitive skin"],
    dimensions: { length: 8, width: 5, height: 20, unit: "cm" },
    weight: { value: 300, unit: "g" }
  },
  {
    name: "Baby Sleep Sack",
    category: "Clothes",
    description: "Cozy sleep sack with zipper closure and soft fabric. Perfect for safe sleep and keeping baby warm at night.",
    price: 3200,
    originalPrice: 3800,
    stock: 35,
    images: ["/uploads/sleepsack-1.jpg"],
    mainImage: "/uploads/sleepsack-1.jpg",
    brand: "Sleep Safe",
    ageGroup: "0-12 months",
    isFeatured: false,
    tags: ["sleep", "safe", "warm", "comfortable"],
    dimensions: { length: 70, width: 40, height: 3, unit: "cm" },
    weight: { value: 250, unit: "g" }
  }
];

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin@1234', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin_bk@babykingdom.lk',
      username: 'admin_bk',
      password: hashedPassword,
      role: 'admin',
      phone: '+94 71 234 5678',
      address: {
        street: '123 Main Street',
        city: 'Bandarawela',
        state: 'Uva Province',
        zipCode: '90100',
        country: 'Sri Lanka'
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Create sample products
const createSampleProducts = async () => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('Products already exist, skipping...');
      return;
    }

    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name}`);
    }

    console.log('Sample products created successfully');
  } catch (error) {
    console.error('Error creating sample products:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    await createAdminUser();
    await createSampleProducts();
    
    console.log('Database seeding completed successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin_bk@babykingdom.lk');
    console.log('Password: admin@1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};