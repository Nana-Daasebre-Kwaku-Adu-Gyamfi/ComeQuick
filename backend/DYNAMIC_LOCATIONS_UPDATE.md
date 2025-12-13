# ComeQuick Backend Updates - Dynamic Locations & Cloudinary Fix

## Summary of Changes

### 1. **Dynamic Location Support**
- **Removed hardcoded location requirement** - Passengers can now select ANY location
- **Added coordinate fields** to Ride model:
  - `pickupCoordinates` (lat, lng) - REQUIRED
  - `destinationCoordinates` (lat, lng) - Optional
  - `locationId` - Now OPTIONAL (for backward compatibility)

### 2. **Driver Pending Rides Endpoint**
- **New endpoint**: `GET /api/rides/pending`
- Returns all pending ride requests (not assigned to any driver)
- Shows passenger details and exact pickup coordinates
- Drivers can see these on a map

### 3. **Cloudinary Profile Upload Fixed**
- **New endpoint**: `POST /api/upload/profile`
- Uploads image to Cloudinary AND saves URL to database in ONE call
- Works for both passengers and drivers
- Automatically detects user type and updates correct profile

---

## API Changes

### Creating a Ride Request (Updated)

**Endpoint**: `POST /api/rides/request`

**Old Request Body**:
```json
{
  "locationId": "required-location-id",
  "pickupLocation": "Main Gate",
  "destination": "Madina",
  "requestedTime": "2025-12-13T10:00:00Z"
}
```

**New Request Body**:
```json
{
  "pickupLocation": "Main Gate, University of Ghana",
  "pickupCoordinates": {
    "lat": 5.6037,
    "lng": -0.1870
  },
  "destination": "Madina Market",
  "destinationCoordinates": {
    "lat": 5.6892,
    "lng": -0.1677
  },
  "requestedTime": "2025-12-13T10:00:00Z"
}
```

**Notes**:
- `pickupCoordinates` is REQUIRED
- `destinationCoordinates` is optional
- `locationId` is optional (for backward compatibility)

---

### Get Pending Rides (New)

**Endpoint**: `GET /api/rides/pending`  
**Access**: Driver only  
**Headers**: `Authorization: Bearer <driver_token>`

**Response**:
```json
{
  "rides": [
    {
      "_id": "ride123",
      "passengerId": {
        "_id": "passenger123",
        "name": "John Doe",
        "phone": "+233501234567"
      },
      "pickupLocation": "Main Gate, University of Ghana",
      "pickupCoordinates": {
        "lat": 5.6037,
        "lng": -0.1870
      },
      "destination": "Madina Market",
      "destinationCoordinates": {
        "lat": 5.6892,
        "lng": -0.1677
      },
      "requestedTime": "2025-12-13T10:00:00Z",
      "status": "pending",
      "createdAt": "2025-12-12T20:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Upload Profile Image (New)

**Endpoint**: `POST /api/upload/profile`  
**Access**: Passenger or Driver  
**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request**:
```
Form Data:
- image: <file>
```

**Response**:
```json
{
  "message": "Profile image uploaded and updated successfully",
  "imageUrl": "https://res.cloudinary.com/xxx/image/upload/v123/comequick/profiles/abc.jpg",
  "publicId": "comequick/profiles/abc",
  "user": {
    "_id": "user123",
    "name": "John Doe",
    "profileImageUrl": "https://res.cloudinary.com/xxx/image/upload/v123/comequick/profiles/abc.jpg",
    ...
  }
}
```

**What it does**:
1. Uploads image to Cloudinary
2. Automatically saves the URL to the user's profile
3. Returns updated user object

---

## Frontend Integration Guide

### 1. Request a Ride with Coordinates

```typescript
// Use browser geolocation or map picker
const requestRide = async (pickupCoords: {lat: number, lng: number}) => {
  const response = await fetch('http://localhost:3000/api/rides/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      pickupLocation: "Main Gate, University of Ghana",
      pickupCoordinates: pickupCoords,
      destination: "Madina Market",
      destinationCoordinates: {
        lat: 5.6892,
        lng: -0.1677
      }
    })
  });
  
  const data = await response.json();
  return data.ride;
};
```

### 2. Driver: Fetch Pending Rides

```typescript
const getPendingRides = async () => {
  const response = await fetch('http://localhost:3000/api/rides/pending', {
    headers: {
      'Authorization': `Bearer ${driverToken}`
    }
  });
  
  const data = await response.json();
  // data.rides contains all pending rides with coordinates
  // Display them on a map using pickupCoordinates
  return data.rides;
};
```

### 3. Upload Profile Image

```typescript
const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('http://localhost:3000/api/upload/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  // data.imageUrl is the Cloudinary URL
  // data.user contains updated user profile
  return data;
};
```

---

## Database Schema Changes

### Ride Model (Updated)

```javascript
{
  passengerId: ObjectId,
  driverId: ObjectId (nullable),
  locationId: ObjectId (now optional),
  
  pickupLocation: String (required),
  pickupCoordinates: {
    lat: Number (required),
    lng: Number (required)
  },
  
  destination: String (required),
  destinationCoordinates: {
    lat: Number (optional),
    lng: Number (optional)
  },
  
  status: 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled',
  requestedTime: Date,
  acceptedAt: Date,
  completedAt: Date,
  ...
}
```

---

## Testing the Changes

### 1. Test Dynamic Location Ride Request

```bash
curl -X POST http://localhost:3000/api/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <passenger_token>" \
  -d '{
    "pickupLocation": "Legon Hall",
    "pickupCoordinates": {"lat": 5.6037, "lng": -0.1870},
    "destination": "Accra Mall",
    "destinationCoordinates": {"lat": 5.6108, "lng": -0.1820}
  }'
```

### 2. Test Get Pending Rides (Driver)

```bash
curl http://localhost:3000/api/rides/pending \
  -H "Authorization: Bearer <driver_token>"
```

### 3. Test Profile Image Upload

```bash
curl -X POST http://localhost:3000/api/upload/profile \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

---

## Migration Notes

**Existing rides without coordinates**: 
- Old rides may not have `pickupCoordinates`
- Frontend should handle this gracefully
- Consider running a migration script to add default coordinates to existing rides

**Backward compatibility**:
- `locationId` is still supported
- Old frontend code will continue to work
- New frontend should use coordinates for better flexibility

---

## Next Steps for Frontend

1. **Update RequestRidePage.tsx**:
   - Add map picker or geolocation to get coordinates
   - Send coordinates with ride request
   - Remove dependency on hardcoded locations

2. **Update DriverDashboardPage.tsx**:
   - Fetch pending rides from `/api/rides/pending`
   - Display rides on map using `pickupCoordinates`
   - Show only real pending rides, not dummy data

3. **Update Profile Upload**:
   - Use `/api/upload/profile` endpoint
   - Remove manual profile update call
   - Image URL is automatically saved

---

## Benefits

✅ **No more hardcoded locations** - Users can pick ANY location  
✅ **Real-time ride matching** - Drivers see actual pending requests  
✅ **Map integration ready** - Coordinates available for map display  
✅ **Cloudinary working** - Images upload and save to database  
✅ **Better UX** - One-step profile image upload  

---

Created: 2025-12-12
