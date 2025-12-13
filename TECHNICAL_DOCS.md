# ComeQuick Technical Documentation

## 1. Project Overview
ComeQuick is a campus ride-hailing application that connects passengers (students/staff) with verified drivers. The system operates in real-time, allowing users to request rides, get matched with drivers, track ride progress, and rate their experience.

## 2. Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (persisted stores for Auth, Driver, and Ride states)
- **Maps**: Leaflet (via React-Leaflet)
- **Notifications**: Sonner (Toast notifications)
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary (via `cloudinary` SDK)
- **Logging**: Winston

## 3. Architecture

### Folder Structure
```
ComeQuick-1/
├── frontend/                # React Client
│   ├── src/
│   │   ├── pages/           # Route components (Passenger, Driver, Admin)
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API service layer (apiService, rideService)
│   │   ├── store/           # Zustand state stores
│   │   ├── types/           # TypeScript definitions
│   │   └── ...
│   └── ...
├── backend/                 # API Server
│   ├── src/
│   │   ├── controllers/     # Route logic
│   │   ├── models/          # Mongoose Schemas (Driver, Passenger, Ride)
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth & Error middlewares
│   │   └── ...
│   └── ...
└── ...
```

### Key Data Models
1.  **Passenger**: Stores name, email, phone, password hash, and `profileImageUrl`.
2.  **Driver**: Stores profile info, car details, license, availability status (`isAvailable`), current ride logic (`currentRideId`), and `profileImageUrl`.
3.  **Ride**: The core transaction record.
    *   **Status Flow**: `pending` -> `matched` -> `in_progress` -> `completed` (or `cancelled`).
    *   **Associations**: Links `passengerId` and `driverId`.
    *   **Coordinates**: Stores `lat`/`lng` for pickup and destination.

## 4. Key Workflows Implementation

### Authentication
*   **Passengers**: Signup/Login via email/password. Returns JWT.
*   **Drivers**: Login via phone/password. Returns JWT.
*   **Protection**: Middleware `protectPassenger` and `protectDriver` verify tokens.

### Ride Logic (Polling-based Real-time)
*   **Requesting**: Passenger posts a request (`/api/rides/request`). Status: `pending`.
*   **Matching**: Drivers poll (`/api/rides/pending`) to see available rides.
*   **Acceptance**: Driver accepts a ride (`/api/rides/:id/accept`). Status: `matched`.
*   **Tracking**: Passenger polls (`/api/rides/active`) to detect when a driver assigns themselves.
*   **Completion**: Driver completes the ride. Passenger rates the ride, which also triggers completion if not done.

### Image Uploads
*   **Endpoint**: `/api/upload/profile`
*   **Flow**: Frontend sends `FormData` -> Backend Multer middleware -> Cloudinary Upload -> URL saved to MongoDB User Document.

## 5. API Reference (Core Endpoints)

### Ride API
- `POST /api/rides/request`: Create new ride.
- `GET /api/rides/active`: Get current passenger's active ride.
- `GET /api/rides/pending`: Get all available rides (Driver only).
- `PUT /api/rides/:id/accept`: Accept a ride (Driver only).
- `PUT /api/rides/:id/rate`: Rate a driver.

### Auth API
- `POST /api/auth/passenger/signup`
- `POST /api/auth/passenger/login`
- `POST /api/auth/driver/login`

## 6. Environment Setup
Required `.env` variables in backend:
- `MONGODB_URI`: Database connection string.
- `JWT_SECRET`: Secret for signing tokens.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image storage.
