import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Car, Phone, User, Settings, ChevronRight, MapPin } from "lucide-react";
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
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (driver) {
      setDriver({
        ...driver,
        name,
        phone,
        carModel,
        carColor,
        licensePlate,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
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
        </PageTransition>
      </main>
    </div>
  );
};

export default DriverProfilePage;
