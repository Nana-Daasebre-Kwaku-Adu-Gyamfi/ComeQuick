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

### Maps and Geospatial Logic
-**Pinpoint Pickup (Passenger)**: Implemented via a `MapPicker` component utilizing `Leaflet`. It features:
    - Initial centering on device GPS via `navigator.geolocation`.
    - Draggable markers with real-time coordinate updates.
    - Reverse geocoding via Nominatim API to convert coordinates back to readable addresses.
-**Visual Dispatch (Driver)**: A dedicated `DriverMapPage` that:
    - Fetches all `pending` rides from the backend.
    - Renders custom HTML markers for each request, including passenger profile photos.
    - Filters out orphaned requests (rides with null `passengerId`) to ensure data integrity.
-**External Navigation**: Integrated with **Google Maps Directions API**.
    - Proactively fetches high-accuracy driver GPS coordinates before launch.
    - Generates a `directions` URL passing both `origin` (driver) and `destination` (passenger) to provide live turn-by-turn routing.

## 5. Security and Data Integrity

### Data Isolation
- **Store Resets**: All Zustand stores (Ride, Auth, Driver) are explicitly reset on logout to prevent sensitive data from persisting across different user sessions on the same browser.
- **Backend Truth**: Ride history is fetched directly from the `/api/rides/history` endpoint on dashboard mount, ensuring users only see their own unique data.

### Request Validation
- **Concurrency Control**: Logic implemented to prevent passengers from creating multiple simultaneous ride requests.
- **Orphan Protection**: UI components implement null-checks (`?.`) for nested data like `passengerId` or `driverId` to prevent crashes if account deletion occurs while a request is active.

## 6. API Reference (Core Endpoints)

### Ride API
- `POST /api/rides/request`: Create ride with `pickupCoordinates`.
- `GET /api/rides/active`: Get current passenger's active ride (returns 200 with null if none, preventing console noise).
- `GET /api/rides/pending`: Get all available rides, filtered for active users.
- `GET /api/rides/history`: Retrieve unique ride history for the authenticated user.
- `PUT /api/rides/:id/accept`: Accept a ride (Driver only).
- `PUT /api/rides/:id/complete`: Finalize a ride.
- `PUT /api/rides/:id/rate`: Rate a driver with textual labels.

### Auth & Upload API
- `POST /api/auth/passenger/login`
- `POST /api/auth/driver/login`
- `POST /api/upload/profile`: Handles profile image processing.

## 7. Environment Setup
Required `.env` variables in backend:
- `MONGODB_URI`: Database connection string.
- `JWT_SECRET`: Secret for signing tokens.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image storage.
- `PORT`: Server port (defaults to 5000).

Required `.env` variables in frontend:
- `VITE_API_URL`: Base URL for the backend API (e.g., hosted Render URL).

## 8. AI Use Declaration

In accordance with transparency guidelines, the following AI tools and platforms were utilized during the development of ComeQuick:

| Tool Name | Provider | Usage / Scope |
| :--- | :--- | :--- |
| **Lovable** | Lovable.dev | Used as the initial baseline generator for the frontend React (Vite) template. It provided the scaffolding for Shadcn UI components and the core project structure, which was then heavily modified and extended manually. |
| **Gemini (Image Generator)** | Google | Used to generate the conceptual assets and base imagery for the **ComeQuick logo** and splash screen branding. |
| **Canva (AI Design Tools)** | Canva | Used to refine the logo design, pick a cohesive and modern color palette, and design the consistent visual theme across the web-app. |
| **Claude** | Anthropic | Utilized for deep debugging of complex geospatial logic, specifically resolving initial rendering issues with **Leaflet** maps and ensuring smooth integration with the **Google Maps GPS API**. |
| **Antigravity** | Google DeepMind | Acted as a primary AI coding assistant for pair programming, refactoring components (e.g., modularizing `MapPicker`), implementing backend security fixes (null-checks, orphaned data filtering), and final documentation. |

### Post-Processing & Verification
All AI-generated code and design assets underwent rigorous human validation:
- **Code**: Every component generated or refactored was manually reviewed for logic errors, tested for responsiveness, and verified against the backend API.
- **Security**: Specific manual intervention was applied to ensure the JWT authentication flow and data isolation (clearing stores on logout) were properly implemented.
- **Logic**: The polling mechanism and map coordinate syncing were manually calibrated to ensure real-time accuracy.
