import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, LogIn, UserPlus, ArrowRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";

const WelcomePage = () => {
  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center p-4">
      <PageTransition>
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">ComeQuick Driver</h1>
            <p className="text-muted-foreground">Start accepting rides today</p>
          </motion.div>

          <Card className="shadow-lg">
            <CardContent className="pt-6 space-y-4">
              {/* View Map */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Map className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">View Ride Requests</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  See all pending ride requests on the map. Login to accept rides.
                </p>
                <Link to="/driver/map">
                  <Button variant="hero" size="lg" className="w-full">
                    <Map className="w-5 h-5" />
                    View Map
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Login/Register */}
              <div className="space-y-3">
                <Link to="/driver/login">
                  <Button variant="outline" size="lg" className="w-full">
                    <LogIn className="w-5 h-5" />
                    Login
                  </Button>
                </Link>
                <Link to="/driver/register">
                  <Button variant="outline" size="lg" className="w-full">
                    <UserPlus className="w-5 h-5" />
                    Sign Up as Driver
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default WelcomePage;
