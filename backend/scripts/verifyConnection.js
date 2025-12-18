import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/database.js';

dotenv.config();

const verifyConnection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('\n Successfully connected to MongoDB!');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    
    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n Existing Collections:');
    if (collections.length === 0) {
      console.log('   (No collections yet - they will be created automatically when you use the API)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Show what collections will be created
    console.log('\n Collections that will be created automatically:');
    console.log('   - passengers (when you register a passenger)');
    console.log('   - drivers (when you register a driver)');
    console.log('   - rides (when a ride is created)');
    console.log('   - locations (when a location is created)');
    
    console.log('\n Your database is ready to use!');
    console.log('   Start the server with: npm run dev');
    console.log('   Collections will be created automatically when you use the API.\n');
    
    process.exit(0);
  } catch (error) {
    console.error(' Connection failed:', error.message);
    process.exit(1);
  }
};

verifyConnection();


