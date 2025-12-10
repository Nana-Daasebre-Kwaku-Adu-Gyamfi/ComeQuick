import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, QrCode, ArrowRight } from "lucide-react";
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
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Scan QR to Start</h2>
                <p className="text-muted-foreground text-sm">
                  Scan the QR code at your location to register and start accepting ride requests.
                </p>
              </div>

              <Link to="/driver/scan-qr">
                <Button variant="hero" size="lg" className="w-full">
                  <QrCode className="w-5 h-5" />
                  Scan QR Code
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

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
