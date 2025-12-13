export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
  sessionToken?: string; // Added on frontend after login
  locationId?: string; // Optional, set when driver goes online
  locationName?: string; // Optional, set when driver goes online
  verifiedAt?: Date; // Optional, set after verification
  isVerified?: boolean;
  isAvailable?: boolean;
  rating?: number;
  ratingCount?: number;
  profileImageUrl?: string;
}

export interface DriverVerificationData {
  name: string;
  phone: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
}

export interface PassengerRequest {
  requestId: string;
  passengerId: string;
  passengerName: string;
  passengerProfileImageUrl?: string;
  pickupLocation: string;
  destination: string;
  requestedTime: Date;
  createdAt: Date;
}

export interface AcceptedRide {
  id: string;
  request: PassengerRequest;
  acceptedAt: Date;
  status: 'accepted' | 'in_progress' | 'completed';
}
