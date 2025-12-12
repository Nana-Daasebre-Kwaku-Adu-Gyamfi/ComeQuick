# Cloudinary Usage Examples

## Complete Workflow: Upload Image and Update Profile

### Step 1: Upload Image to Cloudinary

**Endpoint:** `POST /api/upload`

**Using JavaScript/Fetch:**
```javascript
const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.imageUrl; // Returns: "https://res.cloudinary.com/..."
};
```

**Using Axios:**
```javascript
import axios from 'axios';

const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(
    'http://localhost:3000/api/upload',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.imageUrl;
};
```

### Step 2: Update Profile with Image URL

**For Passengers:**
```javascript
const updatePassengerProfile = async (imageUrl, token) => {
  const response = await fetch('http://localhost:3000/api/passengers/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profileImageUrl: imageUrl
    })
  });

  return await response.json();
};
```

**For Drivers:**
```javascript
const updateDriverProfile = async (imageUrl, token) => {
  const response = await fetch('http://localhost:3000/api/drivers/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profileImageUrl: imageUrl
    })
  });

  return await response.json();
};
```

### Complete Example: React Component

```javascript
import { useState } from 'react';

const ProfileImageUpload = ({ token, userType }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Step 1: Upload to Cloudinary
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const newImageUrl = uploadData.imageUrl;

      // Step 2: Update profile with image URL
      const profileEndpoint = userType === 'driver' 
        ? '/api/drivers/profile' 
        : '/api/passengers/profile';

      const updateResponse = await fetch(
        `http://localhost:3000${profileEndpoint}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            profileImageUrl: newImageUrl
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error('Profile update failed');
      }

      setImageUrl(newImageUrl);
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {imageUrl && (
        <img src={imageUrl} alt="Profile" style={{ width: 100, height: 100 }} />
      )}
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

## Testing with cURL

### 1. Upload Image
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/dfgpqpk83/image/upload/v1234567890/comequick/xyz.jpg",
  "publicId": "comequick/xyz"
}
```

### 2. Update Passenger Profile
```bash
curl -X PUT http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileImageUrl": "https://res.cloudinary.com/dfgpqpk83/image/upload/v1234567890/comequick/xyz.jpg"
  }'
```

### 3. Update Driver Profile
```bash
curl -X PUT http://localhost:3000/api/drivers/profile \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileImageUrl": "https://res.cloudinary.com/dfgpqpk83/image/upload/v1234567890/comequick/xyz.jpg"
  }'
```

### 4. Get Profile (Verify Image URL)
```bash
# For passenger
curl http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# For driver
curl http://localhost:3000/api/drivers/profile \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

## Error Handling

```javascript
const uploadImageWithErrorHandling = async (file, token) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file selected');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Upload
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

## Notes

- Images are automatically optimized by Cloudinary
- Maximum file size: 5MB
- Supported formats: JPG, JPEG, PNG, GIF, WEBP
- Images are stored in the `comequick` folder on Cloudinary
- The `imageUrl` returned is a secure HTTPS URL
- Store the `publicId` if you need to delete the image later

