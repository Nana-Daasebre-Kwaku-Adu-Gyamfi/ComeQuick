import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Phone, Car, Hash, Loader2, Palette } from "lucide-react";
import { mockDriverService } from "@/services/mockDriverService";
import { useDriverStore } from "@/store/driverStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";

const verificationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone required"),
  carModel: z.string().min(2, "Car model is required"),
  carColor: z.string().min(2, "Car color is required"),
  licensePlate: z.string().min(5, "License plate is required"),
});

const VerifyDriverPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const sessionData = useDriverStore((state) => state.sessionData);
  const setDriver = useDriverStore((state) => state.setDriver);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(verificationSchema),
  });

  const onSubmit = async (data: any) => {
    if (!sessionData) {
      toast.error("Session expired");
      navigate("/driver/scan-qr");
      return;
    }

    setIsLoading(true);
    try {
      const driver = await mockDriverService.verifyDriver(
        sessionData.sessionToken,
        sessionData.locationId,
        sessionData.locationName,
        data
      );
      setDriver(driver);
      toast.success("Verification successful!");
      navigate("/driver/dashboard");
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface py-8 px-4">
      <PageTransition>
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle>Driver Verification</CardTitle>
              <CardDescription>Location: {sessionData?.locationName || "Unknown"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" /> Full Name
                  </label>
                  <Input {...register("name")} placeholder="John Doe" disabled={isLoading} />
                  {errors.name && <p className="text-destructive text-sm">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" /> Phone
                  </label>
                  <Input {...register("phone")} placeholder="+233501234567" disabled={isLoading} />
                  {errors.phone && <p className="text-destructive text-sm">{errors.phone.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" /> Car Model
                  </label>
                  <Input {...register("carModel")} placeholder="Toyota Corolla" disabled={isLoading} />
                  {errors.carModel && <p className="text-destructive text-sm">{errors.carModel.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" /> Car Color
                  </label>
                  <Input {...register("carColor")} placeholder="Silver" disabled={isLoading} />
                  {errors.carColor && <p className="text-destructive text-sm">{errors.carColor.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> License Plate
                  </label>
                  <Input {...register("licensePlate")} placeholder="GR-1234-20" className="uppercase" disabled={isLoading} />
                  {errors.licensePlate && <p className="text-destructive text-sm">{errors.licensePlate.message as string}</p>}
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="animate-spin" /> Verifying...</> : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default VerifyDriverPage;
