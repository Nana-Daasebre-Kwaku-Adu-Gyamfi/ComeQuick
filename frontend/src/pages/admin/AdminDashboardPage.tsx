import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, Car, Shield, LogOut, UserX, CheckCircle, 
  XCircle, Search, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/common/PageTransition";
import { toast } from "sonner";
import comequickLogo from "@/assets/comequick-logo.png";

// Mock data for admin
const MOCK_PASSENGERS = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+233 24 123 4567", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+233 24 234 5678", status: "active" },
  { id: "3", name: "Kwame Mensah", email: "kwame@example.com", phone: "+233 24 345 6789", status: "suspended" },
];

const MOCK_DRIVERS = [
  { id: "1", name: "Kofi Driver", phone: "+233 24 111 2222", carModel: "Toyota Corolla", licensePlate: "GR-1234-20", verified: true },
  { id: "2", name: "Ama Driver", phone: "+233 24 333 4444", carModel: "Honda Civic", licensePlate: "GR-5678-21", verified: false },
  { id: "3", name: "Yaw Driver", phone: "+233 24 555 6666", carModel: "Hyundai Elantra", licensePlate: "GR-9012-22", verified: true },
];

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"passengers" | "drivers">("passengers");
  const [passengers, setPassengers] = useState(MOCK_PASSENGERS);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin-auth");
    if (!isAdmin) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    navigate("/admin");
  };

  const handleRemovePassenger = (id: string) => {
    setPassengers(passengers.filter((p) => p.id !== id));
    toast.success("Passenger removed successfully");
  };

  const handleTogglePassengerStatus = (id: string) => {
    setPassengers(
      passengers.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "suspended" : "active" }
          : p
      )
    );
    toast.success("Passenger status updated");
  };

  const handleVerifyDriver = (id: string) => {
    setDrivers(
      drivers.map((d) => (d.id === id ? { ...d, verified: true } : d))
    );
    toast.success("Driver verified successfully");
  };

  const handleRemoveDriver = (id: string) => {
    setDrivers(drivers.filter((d) => d.id !== id));
    toast.success("Driver removed successfully");
  };

  const filteredPassengers = passengers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={comequickLogo} alt="ComeQuick" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">ComeQuick Management</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PageTransition>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{passengers.length}</p>
                    <p className="text-sm text-muted-foreground">Passengers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{drivers.length}</p>
                    <p className="text-sm text-muted-foreground">Drivers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {drivers.filter((d) => !d.verified).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {drivers.filter((d) => d.verified).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === "passengers" ? "default" : "outline"}
                onClick={() => setActiveTab("passengers")}
              >
                <Users className="w-4 h-4" />
                Passengers
              </Button>
              <Button
                variant={activeTab === "drivers" ? "default" : "outline"}
                onClick={() => setActiveTab("drivers")}
              >
                <Car className="w-4 h-4" />
                Drivers
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === "passengers" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Passengers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPassengers.map((passenger) => (
                      <div
                        key={passenger.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{passenger.name}</p>
                          <p className="text-sm text-muted-foreground">{passenger.email}</p>
                          <p className="text-sm text-muted-foreground">{passenger.phone}</p>
                        </div>
                        <Badge
                          variant={passenger.status === "active" ? "default" : "destructive"}
                        >
                          {passenger.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePassengerStatus(passenger.id)}
                          >
                            {passenger.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePassenger(passenger.id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {driver.carModel} • {driver.licensePlate}
                          </p>
                          <p className="text-sm text-muted-foreground">{driver.phone}</p>
                        </div>
                        <Badge variant={driver.verified ? "default" : "secondary"}>
                          {driver.verified ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        <div className="flex gap-2">
                          {!driver.verified && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVerifyDriver(driver.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Verify
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveDriver(driver.id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
