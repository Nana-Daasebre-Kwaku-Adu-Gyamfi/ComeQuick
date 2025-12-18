import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Mail, Phone, User, Settings, ChevronRight, LogOut, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/common/PageTransition";
import { toast } from "sonner";
import comequickLogo from "@/assets/comequick-logo.png";

const ProfilePage = () => {
  const navigate = useNavigate();
  const passenger = useAuthStore((state) => state.passenger);
  const updatePassenger = useAuthStore((state) => state.updatePassenger);
  const logout = useAuthStore((state) => state.logout);
  
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains("dark")
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(passenger?.name || "");
  const [phone, setPhone] = useState(passenger?.phone || "");
  const [profileImage, setProfileImage] = useState<string | null>(passenger?.profileImageUrl || null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = useAuthStore.getState().token;
    
    if (!file || !passenger || !token) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Please use an image smaller than 10MB.");
      return;
    }

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
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Update local passenger state
      updatePassenger({
        ...passenger,
        profileImageUrl: data.imageUrl,
      });

      toast.success("Photo uploaded successfully", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error && error.message.includes("large") 
        ? "Upload failed: Image is larger than 10MB. Please use a smaller photo."
        : "Failed to upload photo";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSave = () => {
    if (passenger) {
      updatePassenger({
        ...passenger,
        name,
        phone,
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
    // Clear ride history and state on logout
    useRideStore.getState().reset();
    toast.success("Logged out successfully");
    navigate("/passenger/login");
  };

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Your Profile</h1>
          </div>
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
                        {passenger?.name ? getInitials(passenger.name) : "U"}
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
                    {isEditing ? (
                      <div className="space-y-3">
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
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-foreground">{passenger?.name}</h2>
                        <p className="text-sm text-muted-foreground">{passenger?.phone}</p>
                        <Button
                          variant="link"
                          className="px-0 h-auto text-primary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-foreground">{passenger?.email}</span>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-foreground">{passenger?.phone}</span>
              </CardContent>
            </Card>

            <Card 
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={toggleDarkMode}
            >
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  {isDarkMode ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5 text-primary" />}
                </div>
                <span className="flex-1 text-foreground">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? "bg-primary" : "bg-muted"}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? "right-1" : "left-1"}`} />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:bg-destructive/10 transition-colors cursor-pointer border-destructive/20"
              onClick={handleLogout}
            >
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <span className="flex-1 text-destructive font-medium">Log Out</span>
                <ChevronRight className="w-5 h-5 text-destructive/50" />
              </CardContent>
            </Card>
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default ProfilePage;
