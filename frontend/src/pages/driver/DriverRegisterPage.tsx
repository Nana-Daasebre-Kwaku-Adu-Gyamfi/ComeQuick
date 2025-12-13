import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Car, User, Phone, Lock, Truck, Palette, Hash, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";
import { useDriverStore } from "@/store/driverStore";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  carModel: z.string().min(2, "Car model is required"),
  carColor: z.string().min(2, "Car color is required"),
  licensePlate: z.string().min(2, "License plate is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const DriverRegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setDriver = useDriverStore((state) => state.setDriver);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      
      const response = await fetch('http://localhost:3000/api/drivers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Add token to driver object as sessionToken
      const driverWithToken = {
        ...result.driver,
        sessionToken: result.token,
      };

      setDriver(driverWithToken);
      toast.success("Account created successfully!");
      navigate("/driver/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Driver Registration</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">Become a Driver</h1>
              <p className="text-muted-foreground">Create your driver account and start earning</p>
            </motion.div>

            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Full Name
                    </label>
                    <Input
                      {...register("name")}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                    </label>
                    <Input
                      {...register("phone")}
                      type="tel"
                      placeholder="+233501234567"
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Car Model */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      Car Model
                    </label>
                    <Input
                      {...register("carModel")}
                      placeholder="Toyota Corolla"
                      disabled={isLoading}
                    />
                    {errors.carModel && (
                      <p className="text-destructive text-sm">{errors.carModel.message}</p>
                    )}
                  </div>

                  {/* Car Color */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      Car Color
                    </label>
                    <Input
                      {...register("carColor")}
                      placeholder="Silver"
                      disabled={isLoading}
                    />
                    {errors.carColor && (
                      <p className="text-destructive text-sm">{errors.carColor.message}</p>
                    )}
                  </div>

                  {/* License Plate */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      License Plate
                    </label>
                    <Input
                      {...register("licensePlate")}
                      placeholder="GR-1234-20"
                      disabled={isLoading}
                    />
                    {errors.licensePlate && (
                      <p className="text-destructive text-sm">{errors.licensePlate.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Password
                    </label>
                    <Input
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-destructive text-sm">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Confirm Password
                    </label>
                    <Input
                      {...register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Car className="w-5 h-5" />
                        Create Driver Account
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      to="/driver/login"
                      className="text-primary font-medium hover:underline"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default DriverRegisterPage;
