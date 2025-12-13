
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
console.log('URI Scheme:', uri.split('://')[0]);
if (uri.includes('localhost')) {
    console.log('URI contains "localhost"');
}
if (uri.includes('127.0.0.1')) {
    console.log('URI contains "127.0.0.1"');
}

const testConnection = async () => {
    try {
        console.log('Attempting to connect with 5s timeout...');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

testConnection();
