import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, Car, Shield, LogOut, UserX, CheckCircle, 
  XCircle, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/common/PageTransition";
import { toast } from "sonner";
import comequickLogo from "@/assets/comequick-logo.png";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"passengers" | "drivers">("passengers");
  const [passengers, setPassengers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("admin-token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin-auth");
    if (!isAdmin) {
      navigate("/admin");
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchPassengers(), fetchDrivers()]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPassengers = async () => {
    try {
      const response = await fetch('https://comequick.onrender.com/api/admin/passengers', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPassengers(data);
      }
    } catch (error) {
      toast.error("Failed to fetch passengers");
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://comequick.onrender.com/api/admin/drivers', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      toast.error("Failed to fetch drivers");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-info");
    navigate("/admin");
  };

  const handleRemovePassenger = async (id: string) => {
    if (!confirm("Are you sure you want to delete this passenger?")) return;
    
    try {
      const response = await fetch(`https://comequick.onrender.com/api/admin/passengers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setPassengers(passengers.filter((p) => p._id !== id));
        toast.success("Passenger removed successfully");
      } else {
        toast.error("Failed to delete passenger");
      }
    } catch (error) {
      toast.error("Error deleting passenger");
    }
  };

  const handleTogglePassengerStatus = async (id: string) => {
    try {
      const response = await fetch(`https://comequick.onrender.com/api/admin/passengers/${id}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPassengers(passengers.map((p) => (p._id === id ? data.passenger : p)));
        toast.success(`Passenger ${data.passenger.isSuspended ? 'suspended' : 'activated'}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleVerifyDriver = async (id: string) => {
    try {
      const response = await fetch(`https://comequick.onrender.com/api/admin/drivers/${id}/verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(drivers.map((d) => (d._id === id ? data.driver : d)));
        toast.success("Driver verified successfully");
      }
    } catch (error) {
      toast.error("Failed to verify driver");
    }
  };

  const handleRemoveDriver = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      const response = await fetch(`https://comequick.onrender.com/api/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setDrivers(drivers.filter((d) => d._id !== id));
        toast.success("Driver removed successfully");
      } else {
        toast.error("Failed to delete driver");
      }
    } catch (error) {
      toast.error("Error deleting driver");
    }
  };

  const filteredPassengers = passengers.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        key={passenger._id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                           {passenger.profileImageUrl ? (
                             <img src={passenger.profileImageUrl} className="w-full h-full object-cover"/>
                           ) : (
                             <Users className="w-6 h-6 text-primary" />
                           )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{passenger.name}</p>
                          <p className="text-sm text-muted-foreground">{passenger.email}</p>
                          <p className="text-sm text-muted-foreground">{passenger.phone}</p>
                        </div>
                        <Badge
                          variant={!passenger.isSuspended ? "default" : "destructive"}
                        >
                          {!passenger.isSuspended ? "Active" : "Suspended"}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePassengerStatus(passenger._id)}
                          >
                            {!passenger.isSuspended ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePassenger(passenger._id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredPassengers.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No passengers found</p>
                    )}
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
                        key={driver._id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                         <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center overflow-hidden">
                           {driver.profileImageUrl ? (
                             <img src={driver.profileImageUrl} className="w-full h-full object-cover"/>
                           ) : (
                             <Car className="w-6 h-6 text-success" />
                           )}
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
                              onClick={() => handleVerifyDriver(driver._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Verify
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveDriver(driver._id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredDrivers.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No drivers found</p>
                    )}
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
