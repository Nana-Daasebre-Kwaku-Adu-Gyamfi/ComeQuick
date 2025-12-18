import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, Navigation, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDriverStore } from "@/store/driverStore";
import { formatDistanceToNow } from "date-fns";
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
  const location = useLocation();
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
          const rides = (data.rides || []).filter((r: any) => r.passengerId);
          setPendingRides(rides);

          // Handle initial selection from navigation state
          const targetId = location.state?.selectedRideId;
          if (targetId && !selectedRide) {
            const targetRide = rides.find((r: any) => r._id === targetId);
            if (targetRide) {
              setSelectedRide(targetRide);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView(
                  [targetRide.pickupCoordinates.lat, targetRide.pickupCoordinates.lng],
                  16
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching pending rides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRides();
    const interval = setInterval(fetchPendingRides, 10000);
    return () => clearInterval(interval);
  }, [driver, location.state]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: 14,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

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

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    pendingRides.forEach((ride) => {
      if (!ride.passengerId) return; // Skip rides with missing passenger data
      
      const isSelected = selectedRide?._id === ride._id;
      const markerHtml = `
        <div style="width: ${isSelected ? '56px' : '40px'}; height: ${isSelected ? '56px' : '40px'}; position: relative; transition: all 0.3s ease;">
          <div style="width: 100%; height: 100%; background: ${isSelected ? '#e11d48' : '#2563eb'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white; overflow: hidden;">
            ${ride.passengerId?.profileImageUrl 
              ? `<img src="${ride.passengerId.profileImageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
              : `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z"/></svg>`
            }
          </div>
          <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${isSelected ? '#e11d48' : '#2563eb'};"></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: markerHtml,
        className: "custom-passenger-marker",
        iconSize: isSelected ? [56, 62] : [40, 46],
        iconAnchor: isSelected ? [28, 62] : [20, 46],
      });

      const marker = L.marker(
        [ride.pickupCoordinates.lat, ride.pickupCoordinates.lng],
        { icon: markerIcon }
      ).addTo(mapInstanceRef.current!);

      marker.on("click", () => {
        setSelectedRide(ride);
        mapInstanceRef.current?.setView([ride.pickupCoordinates.lat, ride.pickupCoordinates.lng], 16);
      });

      markersRef.current.push(marker);
    });

    if (!location.state?.selectedRideId && pendingRides.length > 0 && !selectedRide) {
      const bounds = L.latLngBounds(
        pendingRides.map(ride => [ride.pickupCoordinates.lat, ride.pickupCoordinates.lng])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pendingRides, selectedRide, location.state]);

  const handleAcceptRide = () => {
    if (!driver) {
      setShowAuthPrompt(true);
    } else {
      navigate(`/driver/dashboard`);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {!isLoading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-lg p-3 border border-border">
          <div className="flex items-center gap-2 text-sm">
            {pendingRides.length > 0 ? (
              <>
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-foreground font-medium">{pendingRides.length} active requests</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">No pending requests</span>
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedRide && !showAuthPrompt && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-[1000] p-4"
          >
            <Card className="shadow-2xl max-w-md mx-auto border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full overflow-hidden flex items-center justify-center border border-primary/10">
                      {selectedRide.passengerId?.profileImageUrl ? (
                        <img src={selectedRide.passengerId.profileImageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedRide.passengerId?.name || "Deleted User"}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(selectedRide.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRide(null)} className="p-1 hover:bg-muted rounded-full transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-success" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pickup Point</p>
                      <p className="text-sm font-medium leading-tight">{selectedRide.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                      <Navigation className="w-3.5 h-3.5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Destination</p>
                      <p className="text-sm font-medium leading-tight">{selectedRide.destination}</p>
                    </div>
                  </div>
                </div>

                <Button variant="hero" className="w-full flex items-center gap-2 group" onClick={handleAcceptRide}>
                  Accept Ride
                  <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Sign in to Accept Rides</h2>
                <p className="text-muted-foreground text-sm mb-6">Create a driver account or login to start accepting passenger requests.</p>
                <div className="space-y-3">
                  <Button variant="hero" className="w-full" onClick={() => navigate("/driver/register")}>Sign Up as Driver</Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/driver/login")}>Login</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add CheckCircle2 import to match the Hero button
import { CheckCircle2 } from "lucide-react";

export default DriverMapPage;
