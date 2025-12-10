import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Car, Loader2, Shield } from "lucide-react";
import { mockAuthService } from "@/services/mockAuthService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const pendingPhone = useAuthStore((state) => state.pendingPhone);

  const handleVerify = async () => {
    if (!pendingPhone) {
      toast.error("No phone number to verify");
      navigate("/passenger/signup");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await mockAuthService.verifyOTP(pendingPhone, otp);
      toast.success("Phone verified! Please login to continue.");
      navigate("/passenger/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center p-4">
      <PageTransition>
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">ComeQuick</span>
          </Link>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {pendingPhone || "your phone"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleVerify}
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-foreground text-center">
                    <strong className="text-warning">Demo OTP:</strong> 123456
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default VerifyOTPPage;
