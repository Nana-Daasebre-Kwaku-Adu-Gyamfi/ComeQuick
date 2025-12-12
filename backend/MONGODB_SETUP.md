# MongoDB Setup Guide

## ✅ Connection String Configured

Your MongoDB connection string has been added to `.env`:

```
MONGODB_URI=mongodb+srv://nanakay:1234@comequick.1mvm0ur.mongodb.net/comequick?retryWrites=true&w=majority
```

**Note:** The database name is `comequick` - this will be created automatically if it doesn't exist.

## 📦 Understanding MongoDB Collections

MongoDB doesn't use "tables" like SQL databases. Instead, it uses **collections** which are created automatically when you insert the first document.

### Collections That Will Be Created:

1. **`passengers`** - Created when you register a passenger
2. **`drivers`** - Created when you register a driver  
3. **`rides`** - Created when a ride request is made
4. **`locations`** - Created when you add locations (or use seed script)

## 🚀 Quick Start

### Step 1: Verify Connection

Test your MongoDB connection:

```bash
npm run verify-db
```

This will:
- ✅ Connect to your MongoDB Atlas database
- ✅ Show existing collections
- ✅ Confirm the database is ready

### Step 2: Start the Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: comequick-shard-00-01.1mvm0ur.mongodb.net
Server is running on port 3000 in development mode
```

### Step 3: Seed Initial Data (Optional)

Add some sample locations to your database:

```bash
npm run seed-locations
```

This creates 5 sample locations:
- Downtown
- Airport
- University Campus
- Shopping Mall
- Train Station

## 📊 Collections Will Be Created Automatically

When you use the API, collections are created automatically:

### 1. Register a Passenger
```bash
POST /api/auth/signup
```
→ Creates `passengers` collection

### 2. Register a Driver
```bash
POST /api/drivers/register
```
→ Creates `drivers` collection

### 3. Create a Ride Request
```bash
POST /api/rides/request
```
→ Creates `rides` collection

### 4. Add a Location (or use seed script)
```bash
npm run seed-locations
```
→ Creates `locations` collection

## 🔍 Viewing Your Database

### Option 1: MongoDB Atlas Web Interface

1. Go to https://cloud.mongodb.com/
2. Login with your credentials
3. Navigate to your cluster
4. Click "Browse Collections"
5. You'll see all collections and documents

### Option 2: MongoDB Compass

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using your connection string:
   ```
   mongodb+srv://nanakay:1234@comequick.1mvm0ur.mongodb.net/comequick
   ```
3. Browse collections and documents

## 🧪 Testing the Connection

### Test 1: Verify Connection Script
```bash
npm run verify-db
```

### Test 2: Start Server and Check Logs
```bash
npm run dev
```

Look for:
```
MongoDB Connected: comequick-shard-00-01.1mvm0ur.mongodb.net
```

### Test 3: Create a Test User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'
```

Then check MongoDB Atlas - you should see a `passengers` collection with your test user!

## 📝 Database Schema

### Passengers Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  isVerified: Boolean,
  profileImageUrl: String (optional),
  otp: {
    code: String,
    expiresAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Drivers Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique),
  carModel: String,
  carColor: String,
  licensePlate: String (unique),
  password: String (hashed),
  profileImageUrl: String (optional),
  isVerified: Boolean,
  isAvailable: Boolean,
  locationId: ObjectId (ref: Location),
  currentRideId: ObjectId (ref: Ride),
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Rides Collection
```javascript
{
  _id: ObjectId,
  passengerId: ObjectId (ref: Passenger),
  driverId: ObjectId (ref: Driver, optional),
  locationId: ObjectId (ref: Location),
  pickupLocation: String,
  destination: String,
  requestedTime: Date,
  status: String (pending|matched|in_progress|completed|cancelled),
  acceptedAt: Date (optional),
  completedAt: Date (optional),
  fare: Number (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Locations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  address: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Troubleshooting

### Connection Failed
- ✅ Check your internet connection
- ✅ Verify MongoDB Atlas cluster is running
- ✅ Check IP whitelist in MongoDB Atlas (should allow all IPs or your IP)
- ✅ Verify username/password in connection string

### Collections Not Appearing
- Collections are created automatically on first insert
- Use the API to create data, then check MongoDB Atlas
- Or use the seed script: `npm run seed-locations`

### Authentication Error
- Make sure your MongoDB Atlas user has read/write permissions
- Check if the database user exists in MongoDB Atlas

## 🎯 Next Steps

1. ✅ Verify connection: `npm run verify-db`
2. ✅ Start server: `npm run dev`
3. ✅ Seed locations: `npm run seed-locations` (optional)
4. ✅ Test API endpoints
5. ✅ Check MongoDB Atlas to see your data

## 📚 Useful Commands

```bash
# Verify database connection
npm run verify-db

# Seed sample locations
npm run seed-locations

# Start development server
npm run dev

# View database in MongoDB Atlas
# Go to: https://cloud.mongodb.com/
```

---

**Your MongoDB is configured and ready to use!** 🎉

Collections will be created automatically when you start using the API. No manual table creation needed!


