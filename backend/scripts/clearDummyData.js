import dotenv from 'dotenv';
import connectDB from '../src/config/database.js';
import Passenger from '../src/models/Passenger.js';
import Driver from '../src/models/Driver.js';
import Ride from '../src/models/Ride.js';
import Location from '../src/models/Location.js';

dotenv.config();

const clearDummyData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('\nClearing dummy/test data...\n');
    
    // Clear all collections
    const passengerCount = await Passenger.countDocuments();
    const driverCount = await Driver.countDocuments();
    const rideCount = await Ride.countDocuments();
    const locationCount = await Location.countDocuments();
    
    console.log(`Found:`);
    console.log(`  - ${passengerCount} passengers`);
    console.log(`  - ${driverCount} drivers`);
    console.log(`  - ${rideCount} rides`);
    console.log(`  - ${locationCount} locations`);
    
    // Delete all documents
    await Passenger.deleteMany({});
    await Driver.deleteMany({});
    await Ride.deleteMany({});
    await Location.deleteMany({});
    
    console.log('\n✅ All dummy data cleared!');
    console.log('\n📊 Collections are now empty and ready for real data.');
    console.log('   When you create users through the API, they will appear in the database.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearDummyData();

