import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RefreshCw, MapPin, Navigation, User, Clock, Car, CheckCircle2 } from "lucide-react";
import { mockDriverService } from "@/services/mockDriverService";
import { useDriverStore } from "@/store/driverStore";
import { PassengerRequest } from "@/types/driver.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageTransition } from "@/components/common/PageTransition";
import { formatDistanceToNow } from "date-fns";
import comequickLogo from "@/assets/comequick-logo.png";

const DriverDashboardPage = () => {
  const navigate = useNavigate();
  const driver = useDriverStore((state) => state.driver);
  const currentRide = useDriverStore((state) => state.currentRide);
  const setCurrentRide = useDriverStore((state) => state.setCurrentRide);

  const [requests, setRequests] = useState<PassengerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (!driver) {
      navigate("/driver/scan-qr");
      return;
    }
    loadRequests();
    const interval = setInterval(loadRequests, 10000);
    return () => clearInterval(interval);
  }, [driver]);

  const loadRequests = async () => {
    if (!driver) return;
    setIsLoading(true);
    try {
      const data = await mockDriverService.getPendingRequests(driver.locationId);
      setRequests(data);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (request: PassengerRequest) => {
    if (!driver) return;
    setIsAccepting(request.requestId);
    try {
      const { rideId } = await mockDriverService.acceptRequest(driver.id, request.requestId);
      setCurrentRide({ id: rideId, request, acceptedAt: new Date(), status: "accepted" });
      toast.success("Ride accepted!");
    } catch (error) {
      toast.error("Failed to accept");
    } finally {
      setIsAccepting(null);
    }
  };

  const handleComplete = async () => {
    if (!currentRide) return;
    await mockDriverService.completeRide(currentRide.id);
    setCurrentRide(null);
    toast.success("Ride completed!");
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
              <p className="text-xs text-muted-foreground">{driver.locationName}</p>
            </div>
          </div>
          <Link to="/driver/profile">
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {driver?.name ? getInitials(driver.name) : "D"}
              </AvatarFallback>
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
                  <div className="space-y-2 mb-4">
                    <p className="font-semibold">{currentRide.request.passengerName}</p>
                    <p className="text-sm text-muted-foreground">{currentRide.request.pickupLocation} → {currentRide.request.destination}</p>
                  </div>
                  <Button onClick={handleComplete} variant="success" className="w-full">
                    <CheckCircle2 className="w-4 h-4" /> Complete Ride
                  </Button>
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
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <motion.div
                      key={req.requestId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-xl hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{req.passengerName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(req.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 mb-3 text-sm">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-success" /> {req.pickupLocation}
                        </p>
                        <p className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-destructive" /> {req.destination}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAccept(req)}
                        disabled={!!currentRide || isAccepting === req.requestId}
                        className="w-full"
                      >
                        {isAccepting === req.requestId ? "Accepting..." : "Accept Ride"}
                      </Button>
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
