import { DriverProfile, DriverVerificationData, PassengerRequest } from '../types/driver.types';

const MOCK_LOCATIONS = [
  {
    id: 'loc-1',
    name: 'Ashesi University Campus',
    qrCode: 'COMEQUICK-ASHESI-001',
  },
  {
    id: 'loc-2',
    name: 'Berekuso Junction',
    qrCode: 'COMEQUICK-BEREKUSO-002',
  },
  {
    id: 'loc-3',
    name: 'Madina Station',
    qrCode: 'COMEQUICK-MADINA-003',
  },
];

const MOCK_REQUESTS: PassengerRequest[] = [
  {
    requestId: 'req-1',
    passengerId: 'pass-1',
    passengerName: 'John Doe',
    pickupLocation: 'Main Gate',
    destination: 'Madina Station',
    requestedTime: new Date(),
    createdAt: new Date(Date.now() - 5 * 60000),
  },
  {
    requestId: 'req-2',
    passengerId: 'pass-2',
    passengerName: 'Jane Smith',
    pickupLocation: 'Block A',
    destination: 'Accra Mall',
    requestedTime: new Date(),
    createdAt: new Date(Date.now() - 10 * 60000),
  },
  {
    requestId: 'req-3',
    passengerId: 'pass-3',
    passengerName: 'Kwame Mensah',
    pickupLocation: 'Engineering Building',
    destination: 'Achimota',
    requestedTime: new Date(),
    createdAt: new Date(Date.now() - 3 * 60000),
  },
  {
    requestId: 'req-4',
    passengerId: 'pass-4',
    passengerName: 'Ama Serwaa',
    pickupLocation: 'Library',
    destination: 'Circle',
    requestedTime: new Date(),
    createdAt: new Date(Date.now() - 7 * 60000),
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDriverService = {
  async validateQRCode(qrCode: string): Promise<{ locationId: string; locationName: string; sessionToken: string }> {
    await delay(800);

    const location = MOCK_LOCATIONS.find(l => l.qrCode === qrCode);

    if (!location) {
      throw new Error('Invalid QR code');
    }

    return {
      locationId: location.id,
      locationName: location.name,
      sessionToken: `session-${Date.now()}`,
    };
  },

  async verifyDriver(
    sessionToken: string,
    locationId: string,
    locationName: string,
    data: DriverVerificationData
  ): Promise<DriverProfile> {
    await delay(1000);

    if (!data.name || !data.phone || !data.carModel || !data.licensePlate) {
      throw new Error('All fields are required');
    }

    const driverProfile: DriverProfile = {
      id: `driver-${Date.now()}`,
      ...data,
      sessionToken,
      locationId,
      locationName,
      verifiedAt: new Date(),
    };

    return driverProfile;
  },

  async getPendingRequests(locationId: string): Promise<PassengerRequest[]> {
    await delay(500);
    return MOCK_REQUESTS;
  },

  async acceptRequest(
    driverId: string,
    requestId: string
  ): Promise<{ success: boolean; rideId: string }> {
    await delay(800);

    return {
      success: true,
      rideId: `ride-${Date.now()}`,
    };
  },

  async completeRide(rideId: string): Promise<void> {
    await delay(500);
  },

  getTestQRCode(): string {
    return 'COMEQUICK-ASHESI-001';
  },
};
