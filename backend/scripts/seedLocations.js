import dotenv from 'dotenv';
import connectDB from '../src/config/database.js';
import Location from '../src/models/Location.js';

dotenv.config();

const seedLocations = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Seeding locations...');
    
    const locations = [
      {
        name: 'Downtown',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060,
        },
        address: 'Downtown Area',
      },
      {
        name: 'Airport',
        coordinates: {
          lat: 40.6413,
          lng: -73.7781,
        },
        address: 'Main Airport Terminal',
      },
      {
        name: 'University Campus',
        coordinates: {
          lat: 40.7505,
          lng: -73.9934,
        },
        address: 'University Main Campus',
      },
      {
        name: 'Shopping Mall',
        coordinates: {
          lat: 40.7589,
          lng: -73.9851,
        },
        address: 'Central Shopping Mall',
      },
      {
        name: 'Train Station',
        coordinates: {
          lat: 40.7527,
          lng: -73.9772,
        },
        address: 'Main Train Station',
      },
    ];
    
    // Clear existing locations (optional)
    await Location.deleteMany({});
    console.log('Cleared existing locations...');
    
    // Insert locations
    const createdLocations = await Location.insertMany(locations);
    console.log(`✅ Created ${createdLocations.length} locations:`);
    
    createdLocations.forEach(loc => {
      console.log(`   - ${loc.name} (ID: ${loc._id})`);
    });
    
    console.log('\n✨ Locations seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding locations:', error.message);
    process.exit(1);
  }
};

seedLocations();


