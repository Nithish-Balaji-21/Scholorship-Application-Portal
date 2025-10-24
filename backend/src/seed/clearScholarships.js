const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Clear all scholarships and applications
const clearData = async () => {
  try {
    // Delete all applications first (to maintain referential integrity)
    const deletedApplications = await Application.deleteMany({});
    console.log(`🗑️  Deleted ${deletedApplications.deletedCount} applications`);

    // Delete all scholarships
    const deletedScholarships = await Scholarship.deleteMany({});
    console.log(`🗑️  Deleted ${deletedScholarships.deletedCount} scholarships`);

    console.log('✅ All scholarship data cleared successfully!');
    console.log('\n📝 You can now add Indian scholarships with amounts in Rupees (₹)');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

// Run the clear script
const run = async () => {
  await connectDB();
  await clearData();
  process.exit(0);
};

run();
