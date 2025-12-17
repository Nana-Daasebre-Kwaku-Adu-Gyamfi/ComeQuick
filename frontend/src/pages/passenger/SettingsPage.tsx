import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRideStore } from "@/store/rideStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageTransition } from "@/components/common/PageTransition";
import { useEffect, useState } from "react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };



  const handleLogout = () => {
    logout();
    useRideStore.getState().reset();
    navigate("/");
  };

  const menuItems = [
    {
      icon: Bell,
      label: "Notifications",
      action: () => {},
      hasToggle: false,
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      action: () => {},
      hasToggle: false,
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => {},
      hasToggle: false,
    },
  ];

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PageTransition>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {/* Dark Mode Toggle */}
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-foreground">Dark Mode</span>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </CardContent>
            </Card>

            {/* Other Menu Items */}
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={item.action}
                >
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-foreground">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-4"
            >
              <Card
                className="hover:bg-destructive/10 transition-colors cursor-pointer border-destructive/20"
                onClick={handleLogout}
              >
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="flex-1 text-destructive font-medium">Log Out</span>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default SettingsPage;
