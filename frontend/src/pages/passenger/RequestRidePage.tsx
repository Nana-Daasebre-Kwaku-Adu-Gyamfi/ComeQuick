import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Navigation, Clock, Loader2, ArrowLeft, Crosshair, Map as MapIcon, Check, X } from "lucide-react";
import { rideService } from "@/services/rideService";
import { useAuthStore } from "@/store/authStore";
import { useRideStore } from "@/store/rideStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const rideRequestSchema = z.object({
  pickupLocation: z.string().min(3, "Pickup location is required"),
  destination: z.string().min(3, "Destination is required"),
  requestedTime: z.string().optional(),
});

type RideRequestFormData = z.infer<typeof rideRequestSchema>;

// Map Marker Fix
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

const MapPicker = ({ 
  initialLocation, 
  onConfirm, 
  onCancel 
}: { 
  initialLocation: {lat: number, lng: number}, 
  onConfirm: (coords: {lat: number, lng: number}) => void,
  onCancel: () => void
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const [tempLocation, setTempLocation] = useState(initialLocation);

  useEffect(() => {
    fixLeafletIcons();
    
    if (!mapContainerRef.current) return;

    // We use a small timeout to ensure the DOM is ready and layout is calculated
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstance.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [initialLocation.lat, initialLocation.lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const latLng = (e.target as L.Marker).getLatLng();
        setTempLocation({ lat: latLng.lat, lng: latLng.lng });
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setTempLocation({ lat, lng });
      });

      mapInstance.current = map;
      markerInstance.current = marker;
      
      // Fix for grey tiles/missing layout
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-[400px] w-full bg-muted flex items-center justify-center overflow-hidden"
    >
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />
      
      <div className="absolute top-4 left-4 right-4 z-[1001] flex justify-between gap-2 pointer-events-none">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          className="bg-background/95 backdrop-blur shadow-lg border border-border pointer-events-auto text-foreground hover:bg-muted"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button 
          variant="hero" 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onConfirm(tempLocation); }}
          className="shadow-lg pointer-events-auto"
        >
          <Check className="w-4 h-4 mr-2" />
          Confirm Pickup
        </Button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] bg-background/90 backdrop-blur px-6 py-2.5 rounded-full shadow-xl text-sm font-bold whitespace-nowrap border border-primary/20 text-foreground select-none pointer-events-none ring-1 ring-white/10">
        Drag the marker to your exact location
      </div>
    </motion.div>
  );
};

const RequestRidePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPinpointing, setIsPinpointing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number}>({ 
    lat: 5.6037, 
    lng: -0.1870 
  });
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();
  const passenger = useAuthStore((state) => state.passenger);
  const setCurrentRequest = useRideStore((state) => state.setCurrentRequest);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RideRequestFormData>({
    resolver: zodResolver(rideRequestSchema),
  });

  useEffect(() => {
    handleUseLiveLocation(false);
  }, []);

  const handleUseLiveLocation = (showToast = true) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(coords);
          setMapLocation(coords);
          if (showToast) toast.success("Live location detected");
          reverseGeocode(coords.lat, coords.lng);
        },
        () => {
          if (showToast) toast.error("Could not access your location");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        const shortAddress = data.display_name.split(',').slice(0, 3).join(',').trim();
        setValue("pickupLocation", shortAddress);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleOpenMap = async () => {
    // If we don't have a pinpointed mapLocation yet, try to get live location first
    // to ensure the map opens exactly where the user is
    if (!mapLocation) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(coords);
            setMapLocation(coords);
            setIsPinpointing(true);
          },
          () => {
            // If geolocation fails, still open the map at the last known/default location
            setIsPinpointing(true);
          },
          { enableHighAccuracy: true, timeout: 3000 }
        );
      } else {
        setIsPinpointing(true);
      }
    } else {
      setIsPinpointing(true);
    }
  };

  const handleConfirmPinpoint = (coords: {lat: number, lng: number}) => {
    setCurrentLocation(coords);
    setMapLocation(coords);
    reverseGeocode(coords.lat, coords.lng);
    setIsPinpointing(false);
    toast.success("Location updated");
  };

  const onSubmit = async (data: RideRequestFormData) => {
    if (!passenger) {
      toast.error("Please login first");
      navigate("/passenger/login");
      return;
    }

    if (useRideStore.getState().currentRequest) {
      toast.error("Active request exists");
      navigate("/passenger/active-ride");
      return;
    }

    setIsLoading(true);
    try {
      const ride = await rideService.createRideRequest({
        pickupLocation: data.pickupLocation.trim(),
        pickupCoordinates: currentLocation,
        destination: data.destination.trim(),
        requestedTime: data.requestedTime ? new Date(data.requestedTime) : new Date(),
      });
      setCurrentRequest(ride);
      toast.success("Request submitted!");
      navigate("/passenger/active-ride");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-bold text-foreground">Request Ride</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Where are you going?</h1>
              <p className="text-muted-foreground font-medium">Set your pickup and destination</p>
            </div>

            <Card className="shadow-lg overflow-hidden border-border/50">
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {isPinpointing ? (
                    <MapPicker 
                      key="map-picker"
                      initialLocation={mapLocation || currentLocation}
                      onConfirm={handleConfirmPinpoint}
                      onCancel={() => setIsPinpointing(false)}
                    />
                  ) : (
                    <motion.div
                      key="request-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 space-y-6"
                    >
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-success ring-4 ring-success/20" />
                                Pickup Point
                              </label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUseLiveLocation()}
                                  className="h-8 text-xs text-primary font-bold hover:bg-primary/5"
                                >
                                  <Crosshair className="w-3 h-3 mr-1" />
                                  Live
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleOpenMap}
                                  className="h-8 text-xs text-primary font-bold hover:bg-primary/5"
                                >
                                  <MapIcon className="w-3 h-3 mr-1" />
                                  Map
                                </Button>
                              </div>
                            </div>
                            <Input
                              {...register("pickupLocation")}
                              placeholder="Address or pinpoint on map"
                              className="bg-muted/30 focus-visible:ring-primary"
                            />
                            {errors.pickupLocation && (
                              <p className="text-destructive text-xs font-medium">{errors.pickupLocation.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Navigation className="w-4 h-4 text-destructive" />
                              Destination
                            </label>
                            <Input
                              {...register("destination")}
                              placeholder="Where to?"
                              className="bg-muted/30 focus-visible:ring-primary"
                            />
                            {errors.destination && (
                              <p className="text-destructive text-xs font-medium">{errors.destination.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              Pickup Time (Optional)
                            </label>
                            <Input
                              {...register("requestedTime")}
                              type="datetime-local"
                              className="bg-muted/30 focus-visible:ring-primary"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          variant="hero"
                          size="lg"
                          className="w-full shadow-glow"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="animate-spin mr-2" />
                          ) : (
                            "Request Ride Now"
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default RequestRidePage;
