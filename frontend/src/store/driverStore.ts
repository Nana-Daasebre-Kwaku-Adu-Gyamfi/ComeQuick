import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DriverProfile, AcceptedRide } from '../types/driver.types';

interface DriverStore {
  driver: DriverProfile | null;
  currentRide: AcceptedRide | null;
  sessionData: {
    sessionToken: string;
    locationId: string;
    locationName: string;
  } | null;
  setDriver: (driver: DriverProfile) => void;
  setCurrentRide: (ride: AcceptedRide | null) => void;
  setSessionData: (data: { sessionToken: string; locationId: string; locationName: string } | null) => void;
  logout: () => void;
}

export const useDriverStore = create<DriverStore>()(
  persist(
    (set) => ({
      driver: null,
      currentRide: null,
      sessionData: null,
      setDriver: (driver) => set({ driver }),
      setCurrentRide: (ride) => set({ currentRide: ride }),
      setSessionData: (data) => set({ sessionData: data }),
      logout: () => set({ driver: null, currentRide: null, sessionData: null }),
    }),
    {
      name: 'comequick-driver',
    }
  )
);
