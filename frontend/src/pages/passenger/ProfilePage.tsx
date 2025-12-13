import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Mail, Phone, User, Settings, ChevronRight } from "lucide-react";
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(passenger?.name || "");
  const [phone, setPhone] = useState(passenger?.phone || "");
  const [profileImage, setProfileImage] = useState<string | null>(passenger?.profileImageUrl || null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = useAuthStore.getState().token;
    
    if (!file || !passenger || !token) return;

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

      const response = await fetch('http://localhost:3000/api/upload/profile', {
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
      toast.error("Failed to upload photo", { id: toastId });
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

  return (
    <div className="min-h-screen gradient-surface">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Your Account</h1>
          </div>
          <Link to="/passenger/settings">
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

            <Link to="/passenger/settings">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
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

export default ProfilePage;
