import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, MapPin, Clock, ArrowRight, User, Navigation } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRideStore } from "@/store/rideStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import comequickLogo from "@/assets/comequick-logo.png";

const DashboardPage = () => {
  const navigate = useNavigate();
  const passenger = useAuthStore((state) => state.passenger);
  const rideHistory = useRideStore((state) => state.rideHistory);
  const currentRequest = useRideStore((state) => state.currentRequest);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src={comequickLogo} alt="ComeQuick" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-foreground">ComeQuick</span>
          </Link>
          <Link to="/passenger/profile">
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {passenger?.name ? getInitials(passenger.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Hello, {passenger?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground">Where would you like to go today?</p>
          </motion.div>

          {/* Active Ride Banner */}
          {currentRequest && currentRequest.status === "pending" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium mb-1">You have an active ride request</p>
                      <p className="text-sm opacity-80">Waiting for driver...</p>
                    </div>
                    <Link to="/passenger/active-ride">
                      <Button variant="glass" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link to="/passenger/request-ride">
              <Card className="hover-lift cursor-pointer group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Navigation className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">Request a Ride</h3>
                        <p className="text-muted-foreground">Get matched with a driver instantly</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Ride History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Rides
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rideHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Car className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">No rides yet</p>
                    <p className="text-sm text-muted-foreground">Your completed rides will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rideHistory.slice(0, 5).map((ride) => (
                      <div
                        key={ride.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{ride.driver.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {ride.completedAt && format(ride.completedAt, "MMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                          Completed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default DashboardPage;
