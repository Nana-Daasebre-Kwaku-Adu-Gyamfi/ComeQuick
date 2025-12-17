import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import comequickLogo from "@/assets/comequick-logo.png";

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show splash for 2.5 seconds, then transition
    const splashTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleGetStarted = (type: "passenger" | "driver") => {
    if (type === "passenger") {
      navigate("/passenger/login");
    } else {
      navigate("/driver/map");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(207,75%,45%)] relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!showWelcome ? (
          // Splash Screen - Just Logo
          <motion.div
            key="splash"
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <img 
                src={comequickLogo} 
                alt="ComeQuick" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain"
              />
            </motion.div>
          </motion.div>
        ) : (
          // Welcome Screen with slide-up animation
          <motion.div
            key="welcome"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo moves up */}
            <motion.div 
              className="flex-1 flex items-center justify-center pt-8"
              initial={{ y: 0 }}
              animate={{ y: -40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center">
                <motion.img 
                  src={comequickLogo} 
                  alt="ComeQuick" 
                  className="w-40 h-40 md:w-52 md:h-52 object-contain"
                  initial={{ scale: 1 }}
                  animate={{ scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-white/90 text-lg md:text-xl font-medium mt-4 text-center px-4"
                >
                  Get a ride in seconds
                </motion.p>
              </div>
            </motion.div>

            {/* Bottom buttons slide up */}
            <motion.div
              className="pb-12 px-6 space-y-4"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            >
              <button
                onClick={() => handleGetStarted("passenger")}
                className="w-full py-4 bg-white text-[hsl(207,75%,45%)] font-semibold rounded-xl text-lg shadow-lg hover:bg-white/95 transition-colors"
              >
                Get Started
              </button>
              
              <button
                onClick={() => handleGetStarted("driver")}
                className="w-full py-4 bg-white/20 text-white font-semibold rounded-xl text-lg border border-white/30 hover:bg-white/30 transition-colors"
              >
                I'm a Driver
              </button>

              <p className="text-center text-white/70 text-sm pt-2">
                Already have an account?{" "}
                <button 
                  onClick={() => navigate("/passenger/login")}
                  className="text-white underline"
                >
                  Log in
                </button>
              </p>

              <div className="text-center pt-4">
                <button 
                  onClick={() => navigate("/admin")}
                  className="text-white/50 text-xs hover:text-white transition-colors"
                >
                  Login as Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
