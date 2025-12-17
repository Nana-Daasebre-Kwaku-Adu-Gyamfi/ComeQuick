import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../src/models/Admin.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const email = 'admin@gmail.com';
        const password = 'Admin.password';
        const name = 'System Admin';

        // Check if admin exists
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            console.log('Admin user already exists');

            // Optional: Update password if it exists
            // adminExists.password = password;
            // await adminExists.save();
            // console.log('Admin password updated');
        } else {
            const admin = await Admin.create({
                name,
                email,
                password,
            });
            console.log(`Admin created: ${admin.email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
