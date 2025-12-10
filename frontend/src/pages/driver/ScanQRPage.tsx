import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, ArrowLeft, Loader2, QrCode } from "lucide-react";
import { mockDriverService } from "@/services/mockDriverService";
import { useDriverStore } from "@/store/driverStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/common/PageTransition";

const ScanQRPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setSessionData = useDriverStore((state) => state.setSessionData);

  const handleTestQR = async () => {
    setIsLoading(true);
    try {
      const testQRCode = mockDriverService.getTestQRCode();
      const { locationId, locationName, sessionToken } = await mockDriverService.validateQRCode(testQRCode);
      setSessionData({ sessionToken, locationId, locationName });
      toast.success(`Location: ${locationName}`);
      navigate("/driver/verify");
    } catch (error) {
      toast.error("Invalid QR code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center p-4">
      <PageTransition>
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Scan Location QR</h2>
                <p className="text-muted-foreground">Point your camera at the QR code posted at your location</p>
              </div>

              <div className="aspect-square bg-muted rounded-xl mb-6 flex items-center justify-center border-4 border-dashed border-primary/30">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Camera preview would appear here</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleTestQR} variant="hero" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <QrCode className="w-5 h-5" />}
                  Use Test QR Code
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate("/driver")}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
};

export default ScanQRPage;
