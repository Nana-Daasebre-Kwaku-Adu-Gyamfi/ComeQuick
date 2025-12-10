import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Users, MapPin, ArrowRight, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ComeQuick</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/passenger/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Passenger Login
            </Link>
            <Link to="/driver">
              <Button variant="outline" size="sm">Driver Portal</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Fast & Reliable Campus Rides
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                Get a Ride in
                <span className="text-gradient"> Seconds</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                ComeQuick connects passengers with trusted drivers at campus locations. Request a ride, get matched instantly, and reach your destination safely.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/passenger/login">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <Users className="w-5 h-5" />
                  Request a Ride
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/driver">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Car className="w-5 h-5" />
                  I'm a Driver
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose ComeQuick?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We've designed every aspect of our service to make your campus commute effortless.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Clock,
                title: "Quick Matching",
                description: "Get matched with a nearby driver in under 60 seconds. No waiting, no hassle.",
              },
              {
                icon: Shield,
                title: "Verified Drivers",
                description: "All drivers are verified through our QR code system at designated locations.",
              },
              {
                icon: Star,
                title: "Reliable Service",
                description: "Trusted by thousands of students and staff for safe, comfortable rides.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-lift h-full">
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to get your ride
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Request a Ride",
                description: "Enter your pickup location and destination",
                icon: MapPin,
              },
              {
                step: "02",
                title: "Get Matched",
                description: "We'll find a verified driver near you instantly",
                icon: Users,
              },
              {
                step: "03",
                title: "Enjoy Your Ride",
                description: "Meet your driver and reach your destination safely",
                icon: Car,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 gradient-hero rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="gradient-hero text-primary-foreground overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4LTguMDYtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-primary-foreground/80 mb-8 text-lg">
                    Join thousands of happy passengers and drivers using ComeQuick daily.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/passenger/signup">
                      <Button variant="glass" size="lg" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30">
                        Sign Up as Passenger
                      </Button>
                    </Link>
                    <Link to="/driver">
                      <Button variant="glass" size="lg" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30">
                        Join as Driver
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ComeQuick</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ComeQuick. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
