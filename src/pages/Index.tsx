import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "@/components/StatusIndicator";
import { MosqueCard } from "@/components/MosqueCard";
import { Settings, MapPin, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mosque, UserSettings } from "@/types/mosque";
import { getCurrentPosition, findNearbyMosques, requestLocationPermissions } from "@/utils/location";
import { loadSettings } from "@/utils/storage";
import mosquesData from "@/data/mosques.json";

const Index = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [isInMosque, setIsInMosque] = useState(false);
  const [currentMosque, setCurrentMosque] = useState<Mosque | undefined>();
  const [nearbyMosques, setNearbyMosques] = useState<Mosque[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const savedSettings = await loadSettings();
      setSettings(savedSettings);
      setIsActive(savedSettings.enabled);

      // Request location permissions
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        toast.error("Location permission required for mosque detection");
        return;
      }

      // Initial location check
      await updateLocation();
    } catch (error) {
      console.error("Initialization error:", error);
      toast.error("Failed to initialize app");
    }
  };

  const updateLocation = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Find nearby mosques
      const mosques = mosquesData as Mosque[];
      const nearby = findNearbyMosques(latitude, longitude, mosques, 5000);
      setNearbyMosques(nearby);

      // Check if in any mosque geofence
      const inMosque = nearby.find(mosque => mosque.distance! <= (settings?.geofenceRadius || 100));
      
      if (inMosque && !isInMosque) {
        setIsInMosque(true);
        setCurrentMosque(inMosque);
        toast.success(`Entered ${inMosque.name}`, {
          description: "Phone silenced automatically"
        });
      } else if (!inMosque && isInMosque) {
        setIsInMosque(false);
        toast.info("Left mosque area", {
          description: "Audio settings restored"
        });
        setCurrentMosque(undefined);
      }

      toast.success("Location updated");
    } catch (error) {
      console.error("Location error:", error);
      toast.error("Failed to get location");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitoring = () => {
    setIsActive(!isActive);
    toast.success(isActive ? "Monitoring paused" : "Monitoring activated");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mosque Silent Mode</h1>
                <p className="text-xs text-muted">Auto-silence when near mosques</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Status Card */}
          <StatusIndicator 
            isActive={isActive}
            isInMosque={isInMosque}
            currentMosqueName={currentMosque?.name}
          />

          {/* Controls */}
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              variant={isActive ? "secondary" : "default"}
              onClick={toggleMonitoring}
            >
              {isActive ? "Pause Monitoring" : "Resume Monitoring"}
            </Button>
            <Button 
              variant="outline"
              size="icon"
              onClick={updateLocation}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Nearby Mosques */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Nearby Mosques ({nearbyMosques.length})
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/mosques')}
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {nearbyMosques.length > 0 ? (
                nearbyMosques.slice(0, 3).map(mosque => (
                  <MosqueCard key={mosque.id} mosque={mosque} />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-muted" />
                  <p className="text-muted">No nearby mosques found</p>
                  <p className="text-sm text-muted mt-1">
                    Grant location permission to detect mosques
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
