import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useDriverStore } from "@/store/driverStore";
import { useEffect } from "react";

// Pages
import SplashScreen from "./pages/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Passenger Pages
import LoginPage from "./pages/passenger/LoginPage";
import SignupPage from "./pages/passenger/SignupPage";
import VerifyOTPPage from "./pages/passenger/VerifyOTPPage";
import DashboardPage from "./pages/passenger/DashboardPage";
import RequestRidePage from "./pages/passenger/RequestRidePage";
import ActiveRidePage from "./pages/passenger/ActiveRidePage";
import ProfilePage from "./pages/passenger/ProfilePage";
import SettingsPage from "./pages/passenger/SettingsPage";

// Driver Pages
import WelcomePage from "./pages/driver/WelcomePage";
import ScanQRPage from "./pages/driver/ScanQRPage";
import VerifyDriverPage from "./pages/driver/VerifyDriverPage";
import DriverDashboardPage from "./pages/driver/DriverDashboardPage";
import DriverMapPage from "./pages/driver/DriverMapPage";
import DriverProfilePage from "./pages/driver/DriverProfilePage";
import DriverSettingsPage from "./pages/driver/DriverSettingsPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

const queryClient = new QueryClient();

// Protected route for passengers
const PassengerRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/passenger/login" />;
};

// Protected route for drivers
const DriverRoute = ({ children }: { children: React.ReactNode }) => {
  const driver = useDriverStore((state) => state.driver);
  return driver ? <>{children}</> : <Navigate to="/driver/scan-qr" />;
};

// Theme initializer
const ThemeInit = () => {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <ThemeInit />
        <Toaster />
        <Sonner />
        <Routes>
          {/* Splash / Welcome */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<Index />} />

          {/* Passenger Routes */}
          <Route path="/passenger/login" element={<LoginPage />} />
          <Route path="/passenger/signup" element={<SignupPage />} />
          <Route path="/passenger/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/passenger/dashboard" element={<PassengerRoute><DashboardPage /></PassengerRoute>} />
          <Route path="/passenger/request-ride" element={<PassengerRoute><RequestRidePage /></PassengerRoute>} />
          <Route path="/passenger/active-ride" element={<PassengerRoute><ActiveRidePage /></PassengerRoute>} />
          <Route path="/passenger/profile" element={<PassengerRoute><ProfilePage /></PassengerRoute>} />
          <Route path="/passenger/settings" element={<PassengerRoute><SettingsPage /></PassengerRoute>} />

          {/* Driver Routes */}
          <Route path="/driver" element={<WelcomePage />} />
          <Route path="/driver/map" element={<DriverMapPage />} />
          <Route path="/driver/scan-qr" element={<ScanQRPage />} />
          <Route path="/driver/verify" element={<VerifyDriverPage />} />
          <Route path="/driver/dashboard" element={<DriverRoute><DriverDashboardPage /></DriverRoute>} />
          <Route path="/driver/profile" element={<DriverRoute><DriverProfilePage /></DriverRoute>} />
          <Route path="/driver/settings" element={<DriverRoute><DriverSettingsPage /></DriverRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
