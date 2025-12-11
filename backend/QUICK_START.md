# Quick Start Guide - ComeQuick Backend

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## Step 3: Configure Environment

The `.env` file should already exist. If not, create it with:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/comequick
JWT_SECRET=comequick-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
Server is running on port 3000 in development mode
MongoDB Connected: localhost:27017
```

## Step 5: Test the API

### Test 1: Health Check
Open your browser or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test 2: Root Endpoint
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "ComeQuick API is running",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "passengers": "/api/passengers",
    "drivers": "/api/drivers",
    "rides": "/api/rides"
  }
}
```

## Step 6: Test Passenger Signup

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

Expected response:
```json
{
  "message": "Passenger registered successfully. Please verify OTP.",
  "passenger": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "isVerified": false
  },
  "otp": "123456"
}
```

**Note:** In development mode, the OTP is returned in the response. In production, it would be sent via SMS/Email.

## Step 7: Verify OTP

Use the OTP from the previous response:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

## Step 8: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response for authenticated requests.

## Step 9: Test Protected Route

Use the token from login:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install` again

### Issue: "MongoDB connection error"
**Solution:** 
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist and connection string

### Issue: "Port 3000 already in use"
**Solution:** 
- Change `PORT` in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

### Issue: "JWT verification error"
**Solution:** 
- Ensure `JWT_SECRET` is set in `.env`
- Use a valid token from login response

## Next Steps

1. ✅ Server is running
2. ✅ Health check works
3. ✅ Can signup/login
4. 📖 Read `TESTING_GUIDE.md` for complete API testing
5. 🔗 Integrate with frontend
6. 🚀 Deploy to production

## Using Postman/Thunder Client

1. Import the endpoints from `TESTING_GUIDE.md`
2. Set environment variable: `baseUrl = http://localhost:3000`
3. After login, save token as environment variable
4. Use `{{baseUrl}}/api/...` for requests
5. Add `Authorization: Bearer {{token}}` header for protected routes

## Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB running and connected
- [ ] `.env` file configured
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Can signup a passenger
- [ ] Can verify OTP
- [ ] Can login and get token
- [ ] Can access protected route with token

If all checkboxes are checked, your backend is ready! 🎉

