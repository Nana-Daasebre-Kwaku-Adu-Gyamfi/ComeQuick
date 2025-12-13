import { Passenger, LoginCredentials, SignupData } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

export const apiService = {
  // Signup - creates user and returns token
  async signup(data: SignupData): Promise<{ passenger: Passenger; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      }),
    });

    const result = await handleResponse(response);

    // Map backend response to frontend Passenger type
    return {
      passenger: {
        id: result.passenger.id || result.passenger._id,
        name: result.passenger.name,
        email: result.passenger.email,
        phone: result.passenger.phone,
        isVerified: result.passenger.isVerified,
        profileImageUrl: result.passenger.profileImageUrl,
        createdAt: new Date(),
      },
      token: result.token,
    };
  },

  // Login
  async login(credentials: LoginCredentials): Promise<{ passenger: Passenger; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await handleResponse(response);

    // Map backend response to frontend Passenger type
    return {
      passenger: {
        id: result.passenger.id || result.passenger._id,
        name: result.passenger.name,
        email: result.passenger.email,
        phone: result.passenger.phone,
        isVerified: result.passenger.isVerified,
        profileImageUrl: result.passenger.profileImageUrl,
        createdAt: new Date(),
      },
      token: result.token,
    };
  },

  // Get current user
  async getCurrentUser(token: string): Promise<Passenger | null> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await handleResponse(response);

    return {
      id: result.passenger.id || result.passenger._id,
      name: result.passenger.name,
      email: result.passenger.email,
      phone: result.passenger.phone,
      isVerified: result.passenger.isVerified,
      profileImageUrl: result.passenger.profileImageUrl,
      createdAt: new Date(result.passenger.createdAt || Date.now()),
    };
  },
};

