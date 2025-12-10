import { RideRequest, Ride, Driver, Location } from '../types/ride.types';

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'driver-1',
    name: 'Samuel Mensah',
    phone: '+233247654321',
    carModel: 'Toyota Corolla',
    carColor: 'Silver',
    licensePlate: 'GR-1234-20',
    rating: 4.8,
  },
  {
    id: 'driver-2',
    name: 'Grace Owusu',
    phone: '+233209876543',
    carModel: 'Honda Civic',
    carColor: 'Black',
    licensePlate: 'GR-5678-21',
    rating: 4.9,
  },
  {
    id: 'driver-3',
    name: 'Kwame Asante',
    phone: '+233241234567',
    carModel: 'Hyundai Elantra',
    carColor: 'White',
    licensePlate: 'GR-9012-22',
    rating: 4.7,
  },
];

const MOCK_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Ashesi University Campus' },
  { id: 'loc-2', name: 'Berekuso Junction' },
  { id: 'loc-3', name: 'Adenta Barrier' },
  { id: 'loc-4', name: 'Madina Station' },
  { id: 'loc-5', name: 'Accra Mall' },
];

const mockRequests: RideRequest[] = [];
const mockRides: Ride[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockRideService = {
  async createRideRequest(
    passengerId: string,
    data: {
      locationId: string;
      pickupLocation: string;
      destination: string;
      requestedTime?: Date;
    }
  ): Promise<RideRequest> {
    await delay(1000);
    
    const newRequest: RideRequest = {
      id: `request-${Date.now()}`,
      passengerId,
      locationId: data.locationId,
      pickupLocation: data.pickupLocation,
      destination: data.destination,
      requestedTime: data.requestedTime || new Date(),
      status: 'pending',
      createdAt: new Date(),
    };
    
    mockRequests.push(newRequest);
    
    // Simulate driver matching after 3-8 seconds
    setTimeout(() => {
      this.simulateDriverMatch(newRequest.id);
    }, Math.random() * 5000 + 3000);
    
    return newRequest;
  },

  simulateDriverMatch(requestId: string) {
    const request = mockRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;
    
    request.status = 'matched';
    
    const randomDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    
    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      requestId,
      driver: randomDriver,
      status: 'matched',
      acceptedAt: new Date(),
    };
    
    mockRides.push(newRide);
    
    const event = new CustomEvent('driver-matched', {
      detail: { requestId, ride: newRide },
    });
    window.dispatchEvent(event);
  },

  async getRideRequest(requestId: string): Promise<RideRequest | null> {
    await delay(300);
    return mockRequests.find(r => r.id === requestId) || null;
  },

  async getActiveRide(requestId: string): Promise<Ride | null> {
    await delay(300);
    return mockRides.find(r => r.requestId === requestId) || null;
  },

  async cancelRideRequest(requestId: string): Promise<void> {
    await delay(500);
    
    const request = mockRequests.find(r => r.id === requestId);
    if (request) {
      request.status = 'cancelled';
    }
  },

  async completeRide(rideId: string): Promise<void> {
    await delay(500);
    
    const ride = mockRides.find(r => r.id === rideId);
    if (ride) {
      ride.status = 'completed';
      ride.completedAt = new Date();
    }
  },

  getLocations(): Location[] {
    return MOCK_LOCATIONS;
  },

  getPassengerRequests(passengerId: string): RideRequest[] {
    return mockRequests.filter(r => r.passengerId === passengerId);
  },

  getPassengerRides(passengerId: string): Ride[] {
    const requests = this.getPassengerRequests(passengerId);
    const requestIds = requests.map(r => r.id);
    return mockRides.filter(r => requestIds.includes(r.requestId));
  },
};
