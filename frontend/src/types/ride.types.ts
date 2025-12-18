export type RideStatus = 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled';

export interface Location {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface RideRequest {
  id: string;
  _id?: string; 
  passengerId: string;
  locationId: string;
  pickupLocation: string;
  destination: string;
  requestedTime: Date;
  status: RideStatus;
  createdAt: Date;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
  rating?: number;
  profileImageUrl?: string;
}

export interface Ride {
  id: string;
  _id?: string; 
  requestId: string;
  driverId?: string | Driver; 
  driver?: Driver; 
  status: RideStatus;
  acceptedAt: Date;
  completedAt?: Date;
}

export interface RideState {
  currentRequest: RideRequest | null;
  activeRide: Ride | null;
  rideHistory: Ride[];
}
