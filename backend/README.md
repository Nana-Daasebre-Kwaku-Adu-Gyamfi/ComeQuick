# ComeQuick Backend API

A comprehensive backend API for the ComeQuick ride-sharing application built with Node.js, Express, and MongoDB.

## Features

- ✅ User Authentication (Passengers & Drivers)
- ✅ JWT-based Authorization
- ✅ Ride Management System
- ✅ Driver-Passenger Matching
- ✅ Profile Management
- ✅ Image Upload with Cloudinary
- ✅ Request Validation
- ✅ Rate Limiting
- ✅ Security Middleware (Helmet, CORS)
- ✅ Logging (Winston)
- ✅ Error Handling
- ✅ Testing Framework (Jest)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, validation, etc.)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (logger, token generation)
│   ├── __tests__/       # Test files
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/comequick
     JWT_SECRET=your-secret-key
     FRONTEND_URL=http://localhost:5173
     ```

3. **Set Up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new passenger
- `POST /api/auth/login` - Login passenger
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current passenger (Protected)

### Passengers
- `GET /api/passengers/profile` - Get profile (Protected)
- `PUT /api/passengers/profile` - Update profile (Protected)

### Drivers
- `POST /api/drivers/register` - Register a new driver
- `POST /api/drivers/login` - Login driver
- `POST /api/drivers/verify` - Verify driver (Protected)
- `GET /api/drivers/profile` - Get profile (Protected)
- `PUT /api/drivers/profile` - Update profile (Protected)
- `PUT /api/drivers/availability` - Update availability (Protected)
- `GET /api/drivers/requests` - Get pending ride requests (Protected)

### Rides
- `POST /api/rides/request` - Create ride request (Protected - Passenger)
- `GET /api/rides/active` - Get active ride (Protected - Passenger)
- `GET /api/rides/history` - Get ride history (Protected - Passenger)
- `PUT /api/rides/:id/cancel` - Cancel ride (Protected - Passenger)
- `PUT /api/rides/:id/accept` - Accept ride (Protected - Driver)
- `PUT /api/rides/:id/start` - Start ride (Protected - Driver)
- `PUT /api/rides/:id/complete` - Complete ride (Protected - Driver)
- `GET /api/rides/driver/active` - Get driver's active ride (Protected - Driver)

### Upload
- `POST /api/upload` - Upload image to Cloudinary (Protected - Passenger/Driver)
- `DELETE /api/upload/:publicId` - Delete image from Cloudinary (Protected)

### Health Check
- `GET /api/health` - API health status

## Testing

### Run Tests
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

## Code Quality

### Linting
```bash
npm run lint
npm run lint:fix
```

### Formatting
```bash
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/comequick` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required |

## Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Prevents abuse with request rate limits
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password encryption
- **Input Validation**: Express-validator for request validation

## Logging

Logs are written to:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

Console logging is enabled in development mode.

## Error Handling

All errors are handled by a centralized error handler middleware that:
- Logs errors with Winston
- Returns consistent error responses
- Includes stack traces in development mode

## Database Models

### Passenger
- User information (name, email, phone)
- Authentication (password, OTP)
- Verification status

### Driver
- Driver information (name, phone, car details)
- Location and availability
- Verification status
- Current ride tracking

### Ride
- Passenger and driver references
- Location information
- Status tracking (pending, matched, in_progress, completed, cancelled)
- Fare and rating information

### Location
- Location name and coordinates
- Address information

## Development

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Import and mount in `src/routes/index.js`

### Adding New Models

1. Create model file in `src/models/`
2. Define schema with Mongoose
3. Export model

### Adding Middleware

1. Create middleware file in `src/middleware/`
2. Export middleware function
3. Use in routes or `app.js`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format: `Bearer TOKEN`

## Cloudinary Integration

The backend includes Cloudinary integration for image uploads. See:
- `CLOUDINARY_SETUP.md` - Setup and configuration guide
- `CLOUDINARY_USAGE_EXAMPLE.md` - Usage examples and code samples

**Quick Setup:**
1. Add Cloudinary credentials to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
2. Upload images via `POST /api/upload`
3. Update profile with returned image URL

## Contributing

1. Follow ESLint and Prettier configurations
2. Write tests for new features
3. Update documentation
4. Follow existing code structure

## License

ISC

