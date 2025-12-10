import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, Navigation, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDriverStore } from "@/store/driverStore";
import { formatDistanceToNow } from "date-fns";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Mock passenger requests with coordinates
const MOCK_PASSENGER_REQUESTS = [
  {
    id: "req-1",
    passengerName: "John Doe",
    phone: "+233501234567",
    pickupLocation: "Main Gate",
    destination: "Madina Station",
    coordinates: { lat: 5.7603, lng: -0.2199 },
    createdAt: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "req-2",
    passengerName: "Jane Smith",
    phone: "+233509876543",
    pickupLocation: "Block A",
    destination: "Accra Mall",
    coordinates: { lat: 5.7580, lng: -0.2150 },
    createdAt: new Date(Date.now() - 10 * 60000),
  },
  {
    id: "req-3",
    passengerName: "Kwame Mensah",
    phone: "+233247654321",
    pickupLocation: "Engineering Building",
    destination: "Achimota",
    coordinates: { lat: 5.7620, lng: -0.2230 },
    createdAt: new Date(Date.now() - 3 * 60000),
  },
  {
    id: "req-4",
    passengerName: "Ama Owusu",
    phone: "+233244567890",
    pickupLocation: "Library",
    destination: "East Legon",
    coordinates: { lat: 5.7550, lng: -0.2180 },
    createdAt: new Date(Date.now() - 8 * 60000),
  },
];

interface PassengerRequest {
  id: string;
  passengerName: string;
  phone: string;
  pickupLocation: string;
  destination: string;
  coordinates: { lat: number; lng: number };
  createdAt: Date;
}

const DriverMapPage = () => {
  const navigate = useNavigate();
  const { driver } = useDriverStore();
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerRequest | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Ashesi University area center
  const mapCenter: [number, number] = [5.7590, -0.2190];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: 15,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Center marker icon (driver location)
    const centerIcon = L.divIcon({
      html: `<div style="width: 24px; height: 24px; background: #f97316; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: "custom-center-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add center marker
    L.marker(mapCenter, { icon: centerIcon }).addTo(map);

    // Passenger marker icon
    const passengerIcon = L.divIcon({
      html: `
        <div style="width: 40px; height: 40px; position: relative;">
          <div style="width: 40px; height: 40px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="8" r="4"/>
              <path d="M12 14c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563eb;"></div>
        </div>
      `,
      className: "custom-passenger-marker",
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    });

    // Add passenger markers
    MOCK_PASSENGER_REQUESTS.forEach((passenger) => {
      const marker = L.marker([passenger.coordinates.lat, passenger.coordinates.lng], {
        icon: passengerIcon,
      }).addTo(map);

      marker.on("click", () => {
        setSelectedPassenger(passenger);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleAcceptRide = () => {
    if (!driver) {
      setShowAuthPrompt(true);
    } else {
      navigate("/driver/dashboard");
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
        className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* Legend / Info */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Waiting passengers</span>
        </div>
      </div>

      {/* Passenger count badge */}
      <div className="absolute bottom-24 left-4 z-[1000] bg-white rounded-xl shadow-lg px-4 py-2">
        <p className="text-sm font-medium text-foreground">
          {MOCK_PASSENGER_REQUESTS.length} passengers waiting
        </p>
      </div>

      {/* Selected Passenger Card */}
      <AnimatePresence>
        {selectedPassenger && !showAuthPrompt && (
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
                        {selectedPassenger.passengerName}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(selectedPassenger.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPassenger(null)}
                    className="p-1 hover:bg-muted rounded-full"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium">{selectedPassenger.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="text-sm font-medium">{selectedPassenger.destination}</p>
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
                    You need to verify your driver profile before accepting passenger requests.
                  </p>

                  <div className="space-y-3">
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={() => navigate("/driver/scan-qr")}
                    >
                      Sign Up as Driver
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/driver/scan-qr")}
                    >
                      Already Verified? Scan QR
                    </Button>
                  </div>

                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverMapPage;
