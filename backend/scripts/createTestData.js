import dotenv from 'dotenv';
import connectDB from '../src/config/database.js';
import Passenger from '../src/models/Passenger.js';
import Driver from '../src/models/Driver.js';

dotenv.config();

// AI generated to used during tests and development

const createTestData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('\nCreating test data...\n');
    
    // Create a test passenger
    try {
      const existingPassenger = await Passenger.findOne({ email: 'test@example.com' });
      if (existingPassenger) {
        console.log(' Test passenger already exists');
      } else {
        const passenger = await Passenger.create({
          name: 'Test Passenger',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'password123',
          isVerified: true,
        });
        console.log(' Created test passenger:', passenger.email);
      }
    } catch (error) {
      if (error.code === 11000) {
        console.log(' Test passenger already exists');
      } else {
        console.error('Error creating passenger:', error.message);
      }
    }
    
    // Create a test driver
    try {
      const existingDriver = await Driver.findOne({ phone: '5551234567' });
      if (existingDriver) {
        console.log(' Test driver already exists');
      } else {
        const driver = await Driver.create({
          name: 'Test Driver',
          phone: '5551234567',
          carModel: 'Toyota Camry',
          carColor: 'Blue',
          licensePlate: 'TEST123',
          password: 'driver123',
          isVerified: true,
        });
        console.log(' Created test driver:', driver.phone);
      }
    } catch (error) {
      if (error.code === 11000) {
        console.log(' Test driver already exists');
      } else {
        console.error('Error creating driver:', error.message);
      }
    }
    
    console.log('\n Test data created successfully!');
    console.log('\n Collections in your database:');
    const mongoose = (await import('mongoose')).default;
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    console.log('\n You can now view these collections in MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

createTestData();

