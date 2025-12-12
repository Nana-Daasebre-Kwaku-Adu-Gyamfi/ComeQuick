# Cloudinary Integration Guide

## Setup Instructions

### 1. Add Cloudinary Credentials to .env

Add the following to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dfgpqpk83
CLOUDINARY_API_KEY=749369354659287
CLOUDINARY_API_SECRET=6FnZA65Z40mzjxM9x-GN4K5FApk
```

### 2. Install Dependencies

The required packages are already in `package.json`. Run:

```bash
npm install
```

This will install:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware

## API Endpoints

### Upload Image
**Endpoint:** `POST /api/upload`
**Access:** Private (Requires authentication)

**Request:**
- Method: POST
- Headers: 
  - `Authorization: Bearer YOUR_TOKEN`
  - `Content-Type: multipart/form-data`
- Body: Form data with field name `image`

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/dfgpqpk83/image/upload/v1234567890/comequick/xyz.jpg",
  "publicId": "comequick/xyz"
}
```

### Upload Image (Driver)
**Endpoint:** `POST /api/upload/driver`
**Access:** Private (Requires driver authentication)

Same as above but uses driver authentication.

### Delete Image
**Endpoint:** `DELETE /api/upload/:publicId`
**Access:** Private (Requires authentication)

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/upload/comequick/xyz \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Usage in Frontend

### Upload Profile Image

1. **Upload the image:**
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
const imageUrl = data.imageUrl; // Use this URL
```

2. **Update profile with image URL:**
```javascript
await fetch('http://localhost:3000/api/passengers/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profileImageUrl: imageUrl
  })
});
```

## Database Schema Updates

Both `Passenger` and `Driver` models now include:
- `profileImageUrl` (String, optional) - URL to the profile image stored in Cloudinary

## Image Specifications

- **Max file size:** 5MB
- **Allowed formats:** JPG, JPEG, PNG, GIF, WEBP
- **Auto transformations:** 
  - Max dimensions: 1000x1000px
  - Auto quality optimization
  - Stored in `comequick` folder on Cloudinary

## Testing

### Test Upload Endpoint

1. **Get authentication token** (login first)
2. **Upload an image:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg"
```

3. **Update profile with image URL:**
```bash
curl -X PUT http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileImageUrl": "https://res.cloudinary.com/..."
  }'
```

4. **Get profile to verify:**
```bash
curl http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

Common errors:
- **400:** No file uploaded or invalid file type
- **401:** Not authenticated
- **413:** File too large (>5MB)
- **500:** Cloudinary upload error

## Security Notes

- All upload endpoints require authentication
- File type validation (images only)
- File size limit (5MB)
- Images are stored in Cloudinary, not on server
- Secure URLs are returned (HTTPS)

## Cloudinary Dashboard

You can view all uploaded images in your Cloudinary dashboard:
- URL: https://console.cloudinary.com/
- Login with your Cloudinary account
- Navigate to Media Library to see uploaded images

