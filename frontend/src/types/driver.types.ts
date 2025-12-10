export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
  sessionToken: string;
  locationId: string;
  locationName: string;
  verifiedAt: Date;
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
