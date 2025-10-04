const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

const checkAdmin = async () => {
  try {
    // Check for admin user
    const admin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Username:', admin.username);
      console.log('Role:', admin.role);
      console.log('Password hash:', admin.password.substring(0, 20) + '...');
      console.log('Is Active:', admin.isActive);
    } else {
      console.log('❌ Admin user NOT found');
    }

    // Check for any users
    const allUsers = await User.find({});
    console.log('\n📊 Total users in database:', allUsers.length);
    
    if (allUsers.length > 0) {
      console.log('Users found:');
      allUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin:', error);
    process.exit(1);
  }
};

checkAdmin();
