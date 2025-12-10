import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Car, Phone, MapPin, Navigation, Clock, ArrowLeft, Loader2, CheckCircle2, Star, X } from "lucide-react";
import { mockRideService } from "@/services/mockRideService";
import { useRideStore } from "@/store/rideStore";
import { Ride } from "@/types/ride.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";
import { format } from "date-fns";

const ActiveRidePage = () => {
  const navigate = useNavigate();
  const currentRequest = useRideStore((state) => state.currentRequest);
  const activeRide = useRideStore((state) => state.activeRide);
  const setActiveRide = useRideStore((state) => state.setActiveRide);
  const addToHistory = useRideStore((state) => state.addToHistory);
  const clearRide = useRideStore((state) => state.clearRide);

  const [isWaiting, setIsWaiting] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!currentRequest) {
      navigate("/passenger/dashboard");
      return;
    }

    if (activeRide) {
      setIsWaiting(false);
    }

    const handleDriverMatch = (event: CustomEvent) => {
      const { requestId, ride } = event.detail;
      if (requestId === currentRequest.id) {
        setActiveRide(ride as Ride);
        setIsWaiting(false);
        toast.success("Driver found! Check details below.");
      }
    };

    window.addEventListener("driver-matched", handleDriverMatch as EventListener);

    return () => {
      window.removeEventListener("driver-matched", handleDriverMatch as EventListener);
    };
  }, [currentRequest, activeRide]);

  const handleCancelRequest = async () => {
    if (!currentRequest) return;

    const confirmed = window.confirm("Are you sure you want to cancel this ride request?");
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await mockRideService.cancelRideRequest(currentRequest.id);
      toast.success("Ride request cancelled");
      clearRide();
      navigate("/passenger/dashboard");
    } catch (error) {
      toast.error("Failed to cancel request");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;

    try {
      await mockRideService.completeRide(activeRide.id);
      const completedRide = { ...activeRide, status: "completed" as const, completedAt: new Date() };
      addToHistory(completedRide);
      toast.success("Ride completed! Thank you for using ComeQuick.");
      clearRide();
      navigate("/passenger/dashboard");
    } catch (error) {
      toast.error("Failed to complete ride");
    }
  };

  if (!currentRequest) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/passenger/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              {isWaiting ? "Finding Driver..." : "Ride Details"}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          <div className="max-w-xl mx-auto space-y-6">
            {/* Trip Details Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4">Trip Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 mt-1.5 rounded-full bg-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="font-medium text-foreground">{currentRequest.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="ml-1.5 border-l-2 border-dashed border-border h-4" />
                  <div className="flex items-start gap-3">
                    <Navigation className="w-3 h-3 mt-1.5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="font-medium text-foreground">{currentRequest.destination}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Requested {format(currentRequest.createdAt, "h:mm a")}
                </div>
              </CardContent>
            </Card>

            {/* Waiting State */}
            <AnimatePresence mode="wait">
              {isWaiting && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-12 text-center">
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                          <Car className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Finding Your Driver</h3>
                      <p className="text-muted-foreground mb-2">Searching for available drivers nearby...</p>
                      <p className="text-sm text-muted-foreground">This usually takes 30-60 seconds</p>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleCancelRequest}
                    variant="destructive"
                    size="lg"
                    className="w-full mt-4"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        Cancel Request
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Driver Found State */}
              {!isWaiting && activeRide && (
                <motion.div
                  key="driver-found"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  {/* Success Banner */}
                  <Card className="bg-success/10 border-success/20">
                    <CardContent className="py-4 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                      <div>
                        <p className="font-semibold text-foreground">Driver Assigned!</p>
                        <p className="text-sm text-muted-foreground">Your driver is on the way</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Driver Details */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-foreground">
                            {activeRide.driver.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground">{activeRide.driver.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span>{activeRide.driver.rating || 4.8}</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${activeRide.driver.phone}`}
                          className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center hover:shadow-glow transition-all"
                        >
                          <Phone className="w-5 h-5 text-primary-foreground" />
                        </a>
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Car Model</p>
                          <p className="font-semibold text-foreground text-sm">{activeRide.driver.carModel}</p>
                        </div>
                        <div className="text-center border-x border-border">
                          <p className="text-xs text-muted-foreground mb-1">Color</p>
                          <p className="font-semibold text-foreground text-sm">{activeRide.driver.carColor}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Plate</p>
                          <p className="font-semibold text-foreground text-sm font-mono">{activeRide.driver.licensePlate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Complete Ride Button */}
                  <Button
                    onClick={handleCompleteRide}
                    variant="success"
                    size="lg"
                    className="w-full"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Ride
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default ActiveRidePage;
