import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Car, Phone, User, Settings, ChevronRight, MapPin, Star, Clock } from "lucide-react";
import { useDriverStore } from "@/store/driverStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/common/PageTransition";
import { toast } from "sonner";

const DriverProfilePage = () => {
  const navigate = useNavigate();
  const driver = useDriverStore((state) => state.driver);
  const setDriver = useDriverStore((state) => state.setDriver);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(driver?.name || "");
  const [phone, setPhone] = useState(driver?.phone || "");
  const [carModel, setCarModel] = useState(driver?.carModel || "");
  const [carColor, setCarColor] = useState(driver?.carColor || "");
  const [licensePlate, setLicensePlate] = useState(driver?.licensePlate || "");
  const [profileImage, setProfileImage] = useState<string | null>(driver?.profileImageUrl || null);
  
  // Ride history state
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchRideHistory = async () => {
      if (!driver?.sessionToken) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await fetch('https://comequick.onrender.com/api/rides/driver/history', {
          headers: {
            'Authorization': `Bearer ${driver.sessionToken}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setRideHistory(data.rides || []);
        }
      } catch (error) {
        console.error("Failed to fetch ride history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchRideHistory();
  }, [driver]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !driver?.sessionToken) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const toastId = toast.loading("Uploading photo...");
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://comequick.onrender.com/api/upload/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${driver.sessionToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Update local driver state
      setDriver({
        ...driver,
        profileImageUrl: data.imageUrl,
      });

      toast.success("Photo uploaded successfully", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo", { id: toastId });
    }
  };

  const handleSave = async () => {
    if (!driver?.sessionToken) return;

    const toastId = toast.loading("Saving profile...");
    try {
      const response = await fetch('https://comequick.onrender.com/api/drivers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${driver.sessionToken}`,
        },
        body: JSON.stringify({
          name,
          phone,
          carModel,
          carColor,
          licensePlate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      setDriver({
        ...driver,
        name,
        phone,
        carModel,
        carColor,
        licensePlate,
        profileImageUrl: data.driver?.profileImageUrl || driver.profileImageUrl,
      });

      toast.success("Profile updated successfully!", { id: toastId });
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile", { id: toastId });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!driver) {
    navigate("/driver/scan-qr");
    return null;
  }

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Driver Profile</h1>
          </div>
          <Link to="/driver/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PageTransition>
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {driver?.name ? getInitials(driver.name) : "D"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{driver.name}</h2>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-semibold">{driver.rating ? Number(driver.rating).toFixed(1) : "5.0"}</span>
                      <span className="text-muted-foreground text-sm">({driver.ratingCount || 0} ratings)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    <Button
                      variant="link"
                      className="px-0 h-auto text-primary"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                </div>

                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="carModel">Car Model</Label>
                        <Input
                          id="carModel"
                          value={carModel}
                          onChange={(e) => setCarModel(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="carColor">Car Color</Label>
                        <Input
                          id="carColor"
                          value={carColor}
                          onChange={(e) => setCarColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="licensePlate">License Plate</Label>
                      <Input
                        id="licensePlate"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full">
                      Save Changes
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Vehicle Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1 mb-2">Vehicle Information</h3>
            
            <Card>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Car</p>
                  <p className="text-foreground font-medium">{driver.carColor} {driver.carModel}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground font-bold text-sm">LP</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="text-foreground font-medium">{driver.licensePlate}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground font-medium">{driver.locationName}</p>
                </div>
              </CardContent>
            </Card>

            <Link to="/driver/settings">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer mt-4">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-foreground">Account Settings</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Ride History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-4"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">Recent Rides</h3>
            
            {isLoadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">Loading history...</div>
            ) : rideHistory.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No completed rides yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rideHistory.map((ride) => (
                  <Card key={ride._id || ride.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {ride.passengerId?.name || "Passenger"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ride.completedAt).toLocaleDateString()} • {new Date(ride.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                            Completed
                          </span>
                          {ride.fare && (
                            <span className="text-sm font-bold mt-1">GH₵ {ride.fare}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <div className="flex-1 truncate">
                          <span className="text-foreground/70">From:</span> {ride.pickupLocation}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex-1 truncate">
                          <span className="text-foreground/70">To:</span> {ride.destination}
                        </div>
                      </div>
                      
                      {ride.rating && (
                        <div className="mt-3 flex items-center gap-1 text-sm bg-warning/10 text-warning-foreground w-fit px-2 py-1 rounded">
                          <Star className="w-3 h-3 fill-warning" />
                          <span>Rated: {ride.rating} stars</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default DriverProfilePage;
