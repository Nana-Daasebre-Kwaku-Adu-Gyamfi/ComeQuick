import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RideRequest, Ride } from '../types/ride.types';

interface RideStore {
  currentRequest: RideRequest | null;
  activeRide: Ride | null;
  rideHistory: Ride[];
  setCurrentRequest: (request: RideRequest | null) => void;
  setActiveRide: (ride: Ride | null) => void;
  addToHistory: (ride: Ride) => void;
  clearRide: () => void;
  reset: () => void;
}

export const useRideStore = create<RideStore>()(
  persist(
    (set) => ({
      currentRequest: null,
      activeRide: null,
      rideHistory: [],
      setCurrentRequest: (request) => set({ currentRequest: request }),
      setActiveRide: (ride) => set({ activeRide: ride }),
      addToHistory: (ride) =>
        set((state) => ({ rideHistory: [...state.rideHistory, ride] })),
      clearRide: () => set({ currentRequest: null, activeRide: null }),
      reset: () =>
        set({
          currentRequest: null,
          activeRide: null,
          rideHistory: [],
        }),
    }),
    {
      name: 'comequick-ride',
    }
  )
);
