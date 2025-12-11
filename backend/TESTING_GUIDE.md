# ComeQuick Backend Testing Guide

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   - Update `MONGODB_URI` in `.env` file
   - Default: `mongodb://localhost:27017/comequick`

3. **Environment Setup**
   - Copy `.env.example` to `.env` if not already done
   - Ensure all environment variables are set

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`)

## Testing Endpoints

### 1. Health Check
**Endpoint:** `GET /api/health`

**Test:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Passenger Authentication

#### Signup
**Endpoint:** `POST /api/auth/signup`

**Test:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "Passenger registered successfully. Please verify OTP.",
  "passenger": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "isVerified": false
  },
  "otp": "123456"
}
```

#### Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`

**Test:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

#### Login
**Endpoint:** `POST /api/auth/login`

**Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "passenger": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "isVerified": true
  }
}
```

**Save the token for subsequent requests!**

#### Get Current User
**Endpoint:** `GET /api/auth/me`

**Test:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3. Passenger Profile

#### Get Profile
**Endpoint:** `GET /api/passengers/profile`

**Test:**
```bash
curl http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Update Profile
**Endpoint:** `PUT /api/passengers/profile`

**Test:**
```bash
curl -X PUT http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "9876543210"
  }'
```

---

### 4. Driver Authentication

#### Register Driver
**Endpoint:** `POST /api/drivers/register`

**Test:**
```bash
curl -X POST http://localhost:3000/api/drivers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Driver",
    "phone": "5551234567",
    "carModel": "Toyota Camry",
    "carColor": "Blue",
    "licensePlate": "ABC123",
    "password": "driver123"
  }'
```

#### Login Driver
**Endpoint:** `POST /api/drivers/login`

**Test:**
```bash
curl -X POST http://localhost:3000/api/drivers/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5551234567",
    "password": "driver123"
  }'
```

**Save the driver token!**

#### Verify Driver
**Endpoint:** `POST /api/drivers/verify`

**Test:**
```bash
curl -X POST http://localhost:3000/api/drivers/verify \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE"
```

---

### 5. Ride Management

#### Create Ride Request (Passenger)
**Endpoint:** `POST /api/rides/request`

**First, create a location:**
```bash
# You'll need to create a location in the database first
# Or use an existing locationId from your database
```

**Test:**
```bash
curl -X POST http://localhost:3000/api/rides/request \
  -H "Authorization: Bearer PASSENGER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "LOCATION_ID_HERE",
    "pickupLocation": "123 Main St",
    "destination": "456 Oak Ave",
    "requestedTime": "2024-01-01T10:00:00Z"
  }'
```

#### Get Active Ride (Passenger)
**Endpoint:** `GET /api/rides/active`

**Test:**
```bash
curl http://localhost:3000/api/rides/active \
  -H "Authorization: Bearer PASSENGER_TOKEN_HERE"
```

#### Get Pending Requests (Driver)
**Endpoint:** `GET /api/drivers/requests`

**Test:**
```bash
curl http://localhost:3000/api/drivers/requests \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE"
```

#### Accept Ride (Driver)
**Endpoint:** `PUT /api/rides/:id/accept`

**Test:**
```bash
curl -X PUT http://localhost:3000/api/rides/RIDE_ID_HERE/accept \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE"
```

#### Start Ride (Driver)
**Endpoint:** `PUT /api/rides/:id/start`

**Test:**
```bash
curl -X PUT http://localhost:3000/api/rides/RIDE_ID_HERE/start \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE"
```

#### Complete Ride (Driver)
**Endpoint:** `PUT /api/rides/:id/complete`

**Test:**
```bash
curl -X PUT http://localhost:3000/api/rides/RIDE_ID_HERE/complete \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fare": 25.50
  }'
```

#### Cancel Ride (Passenger)
**Endpoint:** `PUT /api/rides/:id/cancel`

**Test:**
```bash
curl -X PUT http://localhost:3000/api/rides/RIDE_ID_HERE/cancel \
  -H "Authorization: Bearer PASSENGER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my mind"
  }'
```

---

## Running Automated Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

---

## Using Postman or Thunder Client

1. **Import Collection:**
   - Create a new collection in Postman/Thunder Client
   - Add all endpoints listed above
   - Set up environment variables:
     - `baseUrl`: `http://localhost:3000`
     - `passengerToken`: (from login response)
     - `driverToken`: (from driver login response)

2. **Test Flow:**
   - Signup → Verify OTP → Login → Get Profile
   - Register Driver → Login Driver → Verify Driver
   - Create Ride Request → Accept Ride → Start Ride → Complete Ride

---

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check MongoDB Atlas connection string
- Check `MONGODB_URI` in `.env`

### Port Already in Use
- Change `PORT` in `.env` or kill the process using port 3000

### Authentication Errors
- Ensure token is included in `Authorization: Bearer TOKEN` header
- Check if token has expired (default: 7 days)

### Validation Errors
- Check request body matches validation rules
- Ensure all required fields are provided

---

## Database Seeding (Optional)

You can create a script to seed initial data:

```javascript
// scripts/seed.js
import connectDB from '../src/config/database.js';
import Location from '../src/models/Location.js';

// Create sample locations
const locations = [
  { name: 'Downtown', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Airport', coordinates: { lat: 40.6413, lng: -73.7781 } },
];

await Location.insertMany(locations);
```

---

## Monitoring

- Check logs in `logs/` directory
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

---

## Next Steps

1. Test all endpoints using the examples above
2. Integrate with frontend
3. Add more validation and error handling as needed
4. Set up production environment variables
5. Deploy to hosting service (Heroku, AWS, etc.)

