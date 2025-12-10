import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Navigation, Clock, Car, Loader2, ArrowLeft } from "lucide-react";
import { mockRideService } from "@/services/mockRideService";
import { useAuthStore } from "@/store/authStore";
import { useRideStore } from "@/store/rideStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";

const rideRequestSchema = z.object({
  locationId: z.string().min(1, "Please select a location"),
  pickupLocation: z.string().min(3, "Pickup location is required"),
  destination: z.string().min(3, "Destination is required"),
  requestedTime: z.string().optional(),
});

type RideRequestFormData = z.infer<typeof rideRequestSchema>;

const RequestRidePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const passenger = useAuthStore((state) => state.passenger);
  const setCurrentRequest = useRideStore((state) => state.setCurrentRequest);

  const locations = mockRideService.getLocations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RideRequestFormData>({
    resolver: zodResolver(rideRequestSchema),
  });

  const onSubmit = async (data: RideRequestFormData) => {
    if (!passenger) {
      toast.error("Please login first");
      navigate("/passenger/login");
      return;
    }

    setIsLoading(true);
    try {
      const request = await mockRideService.createRideRequest(passenger.id, {
        locationId: data.locationId,
        pickupLocation: data.pickupLocation,
        destination: data.destination,
        requestedTime: data.requestedTime ? new Date(data.requestedTime) : undefined,
      });

      setCurrentRequest(request);
      toast.success("Ride request submitted! Searching for drivers...");
      navigate("/passenger/active-ride");
    } catch (error) {
      toast.error("Failed to create ride request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Request Ride</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">Where are you going?</h1>
              <p className="text-muted-foreground">Fill in your trip details below</p>
            </motion.div>

            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Location Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Select Location
                    </label>
                    <select
                      {...register("locationId")}
                      className="flex h-11 w-full rounded-lg border-2 border-input bg-card px-4 py-2 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary"
                      disabled={isLoading}
                    >
                      <option value="">Choose a location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    {errors.locationId && (
                      <p className="text-destructive text-sm">{errors.locationId.message}</p>
                    )}
                  </div>

                  {/* Pickup Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      Pickup Point
                    </label>
                    <Input
                      {...register("pickupLocation")}
                      placeholder="e.g., Main Gate, Block A"
                      disabled={isLoading}
                    />
                    {errors.pickupLocation && (
                      <p className="text-destructive text-sm">{errors.pickupLocation.message}</p>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-destructive" />
                      Destination
                    </label>
                    <Input
                      {...register("destination")}
                      placeholder="e.g., Madina, Accra Mall"
                      disabled={isLoading}
                    />
                    {errors.destination && (
                      <p className="text-destructive text-sm">{errors.destination.message}</p>
                    )}
                  </div>

                  {/* Requested Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Preferred Time (Optional)
                    </label>
                    <Input
                      {...register("requestedTime")}
                      type="datetime-local"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Car className="w-5 h-5" />
                        Request Ride
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default RequestRidePage;
