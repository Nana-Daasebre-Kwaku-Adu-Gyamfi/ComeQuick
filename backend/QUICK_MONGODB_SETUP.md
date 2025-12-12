# Quick MongoDB Setup

## ✅ Step 1: Create .env File

Create a file named `.env` in the `backend` folder with this content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://nanakay:1234@comequick.1mvm0ur.mongodb.net/comequick?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=comequick-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dfgpqpk83
CLOUDINARY_API_KEY=749369354659287
CLOUDINARY_API_SECRET=6FnZA65Z40mzjxM9x-GN4K5FApk
```

## ✅ Step 2: Verify Connection

Test your MongoDB connection:

```bash
cd backend
npm run verify-db
```

You should see:
```
✅ Successfully connected to MongoDB!
Database: comequick
```

## ✅ Step 3: Start the Server

```bash
npm run dev
```

Look for:
```
MongoDB Connected: comequick-shard-00-01.1mvm0ur.mongodb.net
Server is running on port 3000
```

## 📦 Collections (Tables)

MongoDB doesn't use "tables" - it uses **collections** that are created automatically:

- **`passengers`** - Created when you register a user
- **`drivers`** - Created when you register a driver
- **`rides`** - Created when a ride is requested
- **`locations`** - Created when you add locations

**No manual table creation needed!** Collections are created automatically when you use the API.

## 🎯 Optional: Seed Sample Locations

Add 5 sample locations to your database:

```bash
npm run seed-locations
```

This creates:
- Downtown
- Airport
- University Campus
- Shopping Mall
- Train Station

## 🔍 View Your Database

1. Go to https://cloud.mongodb.com/
2. Login with your MongoDB Atlas account
3. Click "Browse Collections"
4. You'll see all your collections and data

## ✅ That's It!

Your database is connected and ready. Collections will be created automatically when you:
- Register a passenger → creates `passengers` collection
- Register a driver → creates `drivers` collection
- Create a ride → creates `rides` collection

**No manual setup required!** 🎉


