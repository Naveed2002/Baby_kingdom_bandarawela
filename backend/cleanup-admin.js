const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

const cleanupAdmin = async () => {
  try {
    console.log('🧹 Cleaning up duplicate admin users...');
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Username: ${user.username}`);
    });
    
    // Keep only the admin_bk user, delete others
    const usersToDelete = adminUsers.filter(user => 
      user.email !== 'admin_bk@babykingdom.lk'
    );
    
    if (usersToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${usersToDelete.length} duplicate admin users...`);
      
      for (const user of usersToDelete) {
        await User.findByIdAndDelete(user._id);
        console.log(`Deleted: ${user.email}`);
      }
    } else {
      console.log('\n✅ No duplicate admin users to delete');
    }
    
    // Verify the remaining admin user
    const remainingAdmin = await User.findOne({ email: 'admin_bk@babykingdom.lk' });
    
    if (remainingAdmin) {
      console.log('\n✅ Remaining admin user:');
      console.log('Name:', remainingAdmin.name);
      console.log('Email:', remainingAdmin.email);
      console.log('Username:', remainingAdmin.username);
      console.log('Role:', remainingAdmin.role);
      console.log('Is Active:', remainingAdmin.isActive);
    }
    
    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
    console.log('\n🎯 Admin Login Credentials:');
    console.log('Username: admin_bk');
    console.log('Email: admin_bk@babykingdom.lk');
    console.log('Password: admin@1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up admin users:', error);
    process.exit(1);
  }
};

cleanupAdmin();
