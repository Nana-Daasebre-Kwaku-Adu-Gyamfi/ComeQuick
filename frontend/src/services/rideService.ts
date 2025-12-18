import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://comequick.onrender.com/api';

// Helper function to get auth token
const getToken = () => {
    return useAuthStore.getState().token;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
    const data = await response.json();

    if (!response.ok) {
        console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data
        });

        // Log the full data object to see structure
        console.error('Full error data:', JSON.stringify(data, null, 2));

        let errorMessage = data.message || 'An error occurred';

        if (data.errors) {
            if (Array.isArray(data.errors)) {
                errorMessage += ': ' + data.errors.join(', ');
            } else if (typeof data.errors === 'object') {
                errorMessage += ': ' + JSON.stringify(data.errors);
            }
        }

        if (data.details) {
            console.error('Error details:', JSON.stringify(data.details, null, 2));
        }

        throw new Error(errorMessage);
    }

    return data;
};

export const rideService = {
    // Create a ride request
    async createRideRequest(data: {
        pickupLocation: string;
        pickupCoordinates: { lat: number; lng: number };
        destination: string;
        destinationCoordinates?: { lat: number; lng: number };
        requestedTime?: Date;
    }) {
        const token = getToken();

        // Log the exact payload being sent
        const payload = JSON.stringify(data);
        console.log('Request payload (stringified):', payload);
        console.log('Request payload (parsed back):', JSON.parse(payload));

        const response = await fetch(`${API_BASE_URL}/rides/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: payload,
        });

        const result = await handleResponse(response);
        return result.ride;
    },

    // Get active ride
    async getActiveRide() {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/rides/active`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await handleResponse(response);
        return result.ride;
    },

    // Cancel ride
    async cancelRide(rideId: string, reason?: string) {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/rides/${rideId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });

        const result = await handleResponse(response);
        return result.ride;
    },

    // Get ride history
    async getRideHistory() {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/rides/history`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await handleResponse(response);
        return result.rides;
    },

    async pollRideStatus(rideId: string) {
        return this.getActiveRide();
    },
};
