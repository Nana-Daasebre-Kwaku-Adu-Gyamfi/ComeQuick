import { Passenger, LoginCredentials, SignupData } from '../types/auth.types';

const MOCK_PASSENGERS: Passenger[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+233501234567',
    isVerified: true,
    createdAt: new Date('2024-01-15'),
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<{ passenger: Passenger; token: string }> {
    await delay(1000);
    
    const passenger = MOCK_PASSENGERS.find(p => p.email === credentials.email);
    
    if (!passenger || credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }
    
    return {
      passenger,
      token: `mock-token-${passenger.id}-${Date.now()}`,
    };
  },

  async signup(data: SignupData): Promise<{ passenger: Passenger; requiresOTP: boolean }> {
    await delay(1500);
    
    const existingPassenger = MOCK_PASSENGERS.find(p => p.email === data.email);
    
    if (existingPassenger) {
      throw new Error('Email already registered');
    }
    
    const newPassenger: Passenger = {
      id: `passenger-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      isVerified: false,
      createdAt: new Date(),
    };
    
    MOCK_PASSENGERS.push(newPassenger);
    
    return {
      passenger: newPassenger,
      requiresOTP: true,
    };
  },

  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    await delay(800);
    
    if (otp !== '123456') {
      throw new Error('Invalid OTP');
    }
    
    const passenger = MOCK_PASSENGERS.find(p => p.phone === phone);
    if (passenger) {
      passenger.isVerified = true;
    }
    
    return true;
  },

  async getCurrentUser(token: string): Promise<Passenger | null> {
    await delay(500);
    
    const passengerId = token.split('-')[2];
    return MOCK_PASSENGERS.find(p => p.id === passengerId) || null;
  },
};
