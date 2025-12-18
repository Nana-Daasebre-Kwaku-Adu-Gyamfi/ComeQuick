import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RefreshCw, MapPin, Navigation, User, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useDriverStore } from "@/store/driverStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageTransition } from "@/components/common/PageTransition";
import { formatDistanceToNow } from "date-fns";
import comequickLogo from "@/assets/comequick-logo.png";

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
  requestedTime: string;
}

const DriverDashboardPage = () => {
  const navigate = useNavigate();
  const driver = useDriverStore((state) => state.driver);
  const currentRide = useDriverStore((state) => state.currentRide);
  const setCurrentRide = useDriverStore((state) => state.setCurrentRide);
  const logout = useDriverStore((state) => state.logout);

  const [requests, setRequests] = useState<PendingRide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  const openMap = (lat: number, lng: number) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${lat},${lng}&travelmode=driving`, '_blank');
        },
        () => {
          // if geolocation fails - let Google use its default 'My Location'
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/driver/login");
  };

  useEffect(() => {
    if (!driver) {
      navigate("/driver/login");
      return;
    }
    loadRequests();
    checkActiveRide();
    const interval = setInterval(() => {
      loadRequests();
      checkActiveRide();
    }, 5000); // Checking for ride request every 5 seconds
    return () => clearInterval(interval);
  }, [driver, navigate]);

  const checkActiveRide = async () => {
    if (!driver) return;
    try {
      const response = await fetch('https://comequick.onrender.com/api/rides/driver/active', {
        headers: {
          'Authorization': `Bearer ${driver.sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const ride = data.ride;
        setCurrentRide({
          id: ride._id,
          request: {
            requestId: ride._id,
            passengerId: ride.passengerId._id,
            passengerName: ride.passengerId.name,
            passengerProfileImageUrl: ride.passengerId.profileImageUrl,
            pickupLocation: ride.pickupLocation,
            pickupCoordinates: ride.pickupCoordinates,
            destination: ride.destination,
            requestedTime: new Date(ride.requestedTime),
            createdAt: new Date(ride.createdAt),
          },
          acceptedAt: new Date(ride.acceptedAt),
          status: ride.status === 'matched' ? 'accepted' : ride.status as any,
        });
      } else if (response.status === 404) {
        const storedRide = useDriverStore.getState().currentRide;
        if (storedRide) {
          toast.info("Ride has ended or was cancelled");
          setCurrentRide(null);
        }
      }
    } catch (error) {
      console.error('Error checking active ride:', error);
    }
  };

  const loadRequests = async () => {
    if (!driver) return;
    // setIsLoading(true); 
    try {
      const response = await fetch('https://comequick.onrender.com/api/rides/pending', {
        headers: {
          'Authorization': `Bearer ${driver.sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rides = (data.rides || []).filter((r: any) => r.passengerId);
        setRequests(rides);
      } else {
        console.error('Failed to load requests');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (request: PendingRide) => {
    if (!driver) return;
    setIsAccepting(request._id);
    try {
      const response = await fetch(`https://comequick.onrender.com/api/rides/${request._id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driver.sessionToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept ride');
      }

      const data = await response.json();
      
      // Update current ride in store
      setCurrentRide({
        id: data.ride._id,
        request: {
          requestId: request._id,
          passengerId: request.passengerId._id,
          passengerName: request.passengerId.name,
          passengerProfileImageUrl: request.passengerId.profileImageUrl,
          pickupLocation: request.pickupLocation,
          pickupCoordinates: request.pickupCoordinates,
          destination: request.destination,
          requestedTime: new Date(request.requestedTime),
          createdAt: new Date(request.createdAt),
        },
        acceptedAt: new Date(),
        status: "accepted",
      });

      toast.success("Ride accepted!");
      loadRequests(); 
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error("Failed to accept ride");
    } finally {
      setIsAccepting(null);
    }
  };

  const handleComplete = async () => {
    if (!currentRide || !driver) return;
    try {
      const response = await fetch(`https://comequick.onrender.com/api/rides/${currentRide.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driver.sessionToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete ride');
      }

      setCurrentRide(null);
      toast.success("Ride completed!");
      loadRequests();
    } catch (error) {
      console.error('Error completing ride:', error);
      toast.error("Failed to complete ride");
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!driver) return null;

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={comequickLogo} alt="ComeQuick" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-bold text-foreground">{driver.name}</p>
              <p className="text-xs text-muted-foreground">{driver.carModel} • {driver.licensePlate}</p>
            </div>
          </div>
          <Link to="/driver/profile">
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              {driver?.profileImageUrl ? (
                <img src={driver.profileImageUrl} alt={driver.name} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {driver?.name ? getInitials(driver.name) : "D"}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PageTransition>
          {/* Current Ride */}
          {currentRide && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <Card className="bg-success/10 border-success/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <h3 className="font-bold text-foreground">Active Ride</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-12 h-12 rounded-full overflow-hidden border border-success/30 bg-background">
                       {currentRide.request.passengerProfileImageUrl ? (
                         <img src={currentRide.request.passengerProfileImageUrl} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-primary/10">
                           <User className="w-6 h-6 text-primary" />
                         </div>
                       )}
                     </div>
                    <div>
                      <p className="font-semibold">{currentRide.request.passengerName}</p>
                      <p className="text-sm text-muted-foreground">{currentRide.request.pickupLocation} → {currentRide.request.destination}</p>
                    </div>
                  </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => openMap(currentRide.request.pickupCoordinates!.lat, currentRide.request.pickupCoordinates!.lng)}
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <Navigation className="w-4 h-4 mr-2" /> Navigate to Pickup
                    </Button>
                    <Button onClick={handleComplete} variant="default" className="flex-1 bg-success hover:bg-success/90">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Ride
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Waiting Passengers ({requests.length})
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={loadRequests} disabled={isLoading}>
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && requests.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">No pending requests</p>
                  <p className="text-sm text-muted-foreground mt-1">New ride requests will appear here automatically</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-xl hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                          {req.passengerId.profileImageUrl ? (
                             <img src={req.passengerId.profileImageUrl} alt={req.passengerId.name} className="w-full h-full object-cover" />
                          ) : (
                             <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{req.passengerId.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 mb-3 text-sm">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" /> {req.pickupLocation}
                        </p>
                        <p className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-green-600" /> {req.destination}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => openMap(req.pickupCoordinates.lat, req.pickupCoordinates.lng)}
                          className="flex-1"
                          variant="outline"
                        >
                          <Navigation className="w-4 h-4 mr-2" /> View Map
                        </Button>
                        <Button
                          onClick={() => handleAccept(req)}
                          disabled={!!currentRide || isAccepting === req._id}
                          className="flex-1"
                          variant="hero"
                        >
                          {isAccepting === req._id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            "Accept Ride"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </PageTransition>
      </main>
    </div>
  );
};

export default DriverDashboardPage;
