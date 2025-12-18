import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, Navigation, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDriverStore } from "@/store/driverStore";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PendingRide {
  _id: string;
  passengerId: {
    _id: string;
    name: string;
    phone: string;
    profileImageUrl?: string;
  };
  pickupLocation: string;
  pickupCoordinates: {
    lat: number;
    lng: number;
  };
  destination: string;
  createdAt: string;
}

const DriverMapPage = () => {
  const navigate = useNavigate();
  const { driver } = useDriverStore();
  const [pendingRides, setPendingRides] = useState<PendingRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<PendingRide | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Default map center (Ashesi University area)
  const mapCenter: [number, number] = [5.7590, -0.2190];

  // Fetch pending rides from backend
  useEffect(() => {
    const fetchPendingRides = async () => {
      try {
        const response = await fetch('https://comequick.onrender.com/api/rides/pending', {
          headers: {
            'Authorization': `Bearer ${driver?.sessionToken || ''}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingRides(data.rides || []);
        } else {
          console.error('Failed to fetch pending rides:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching pending rides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRides();

    // Poll for new rides every 10 seconds
    const interval = setInterval(fetchPendingRides, 10000);

    return () => clearInterval(interval);
  }, [driver]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: 14,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when pending rides change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each pending ride
    pendingRides.forEach((ride) => {
      // Custom marker content: generic icon or user profile image
      const markerHtml = ride.passengerId.profileImageUrl 
        ? `
          <div style="width: 48px; height: 48px; position: relative;">
            <div style="width: 48px; height: 48px; border-radius: 50%; border: 3px solid #2563eb; background: white; overflow: hidden; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); animation: pulse 2s infinite;">
              <img src="${ride.passengerId.profileImageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb;"></div>
          </div>
        `
        : `
          <div style="width: 40px; height: 40px; position: relative;">
            <div style="width: 40px; height: 40px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); animation: pulse 2s infinite;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="8" r="4"/>
                <path d="M12 14c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z"/>
              </svg>
            </div>
            <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb;"></div>
          </div>
        `;

      const markerIcon = L.divIcon({
        html: markerHtml,
        className: "custom-passenger-marker",
        iconSize: ride.passengerId.profileImageUrl ? [48, 56] : [40, 48],
        iconAnchor: ride.passengerId.profileImageUrl ? [24, 56] : [20, 48],
      });

      const marker = L.marker(
        [ride.pickupCoordinates.lat, ride.pickupCoordinates.lng],
        { icon: markerIcon }
      ).addTo(mapInstanceRef.current!);

      marker.on("click", () => {
        setSelectedRide(ride);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are any
    if (pendingRides.length > 0) {
      const bounds = L.latLngBounds(
        pendingRides.map(ride => [ride.pickupCoordinates.lat, ride.pickupCoordinates.lng])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pendingRides]);

  const handleAcceptRide = () => {
    if (!driver) {
      setShowAuthPrompt(true);
    } else {
      // Navigate to driver dashboard to accept the ride
      navigate(`/driver/dashboard`);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* Legend / Info */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">Waiting passengers</span>
        </div>
      </div>

      {/* Passenger count badge */}
      <div className="absolute bottom-24 left-4 z-[1000] bg-white rounded-xl shadow-lg px-4 py-2">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground">
            {pendingRides.length} {pendingRides.length === 1 ? 'passenger' : 'passengers'} waiting
          </p>
        )}
      </div>

      {/* Selected Ride Card */}
      <AnimatePresence>
        {selectedRide && !showAuthPrompt && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-[1000] p-4"
          >
            <Card className="shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedRide.passengerId.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(selectedRide.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRide(null)}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium">{selectedRide.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="text-sm font-medium">{selectedRide.destination}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleAcceptRide}
                >
                  Accept Ride
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Prompt Modal */}
      <AnimatePresence>
        {showAuthPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowAuthPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-sm shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Sign in to Accept Rides
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Create a driver account or login to start accepting passenger requests.
                  </p>

                  <div className="space-y-3">
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={() => navigate("/driver/register")}
                    >
                      Sign Up as Driver
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/driver/login")}
                    >
                      Login
                    </Button>
                  </div>

                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No rides message */}
      {!isLoading && pendingRides.length === 0 && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">
          <Card className="max-w-sm pointer-events-auto">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Pending Rides</h3>
              <p className="text-sm text-muted-foreground">
                There are no passenger requests at the moment. New requests will appear on the map automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DriverMapPage;
