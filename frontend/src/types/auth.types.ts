export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  profileImageUrl?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  passenger: Passenger | null;
  isAuthenticated: boolean;
  token: string | null;
}
