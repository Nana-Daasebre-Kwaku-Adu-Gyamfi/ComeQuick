export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
  sessionToken?: string; 
  locationId?: string; 
  locationName?: string; 
  verifiedAt?: Date; 
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
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
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
