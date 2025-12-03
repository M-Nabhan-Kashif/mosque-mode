import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Navigation, Volume2, VolumeX, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GeofenceControl from "@/plugins/GeofenceControl";
import AudioControl from "@/plugins/AudioControl";
import { getCurrentPosition, findNearbyMosques, isInGeofence } from "@/utils/location";
import { Mosque, UserSettings } from "@/types/mosque";
import mosquesData from "@/data/mosques.json";
import { loadSettings, saveSettings, defaultSettings } from "@/utils/storage";

const Index = () => {
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMosque, setCurrentMosque] = useState<Mosque | null>(null);
  const [nearbyMosques, setNearbyMosques] = useState<Mosque[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const savedSettings = await loadSettings();
      setSettings(savedSettings);
      setIsMonitoring(savedSettings.enabled);

      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      await updateLocation(latitude, longitude, savedSettings);

      if (savedSettings.backgroundUpdatesEnabled) {
        await GeofenceControl.startBackgroundUpdates({ 
          searchRadius: savedSettings.searchRadius 
        });
      }
    } catch (error) {
      console.error("Failed to initialize:", error);
      toast.error("Please enable location services");
    }
  };

  const updateLocation = async (lat: number, lng: number, currentSettings: UserSettings) => {
    const mosques = mosquesData as Mosque[];
    const searchRadius = currentSettings.searchRadius || 5000;
    const nearby = await findNearbyMosques(lat, lng, mosques, searchRadius);
    setNearbyMosques(nearby);

    const activeMosque = nearby.find(m => 
      isInGeofence(lat, lng, m, currentSettings.geofenceRadius)
    );

    if (activeMosque && activeMosque.id !== currentMosque?.id) {
      handleMosqueEntry(activeMosque);
    } else if (!activeMosque && currentMosque) {
      handleMosqueExit();
    }
  };

  const handleMosqueEntry = async (mosque: Mosque) => {
    setCurrentMosque(mosque);
    if (settings.enabled) {
      await AudioControl.applyMosqueMode();
      if (settings.notificationsEnabled) {
        toast.success(`Entered ${mosque.name}: Silent mode active`);
      }
    }
  };

  const handleMosqueExit = async () => {
    setCurrentMosque(null);
    if (settings.enabled) {
      await AudioControl.restoreFromMosqueMode();
      if (settings.notificationsEnabled) {
        toast.info("Left mosque: Audio restored");
      }
    }
  };

  const toggleMonitoring = async (enabled: boolean) => {
    setIsMonitoring(enabled);
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
    
    if (enabled) {
      toast.success("Monitoring enabled");
      // Trigger immediate check
      const position = await getCurrentPosition();
      updateLocation(position.coords.latitude, position.coords.longitude, newSettings);
    } else {
      toast.info("Monitoring disabled");
      if (currentMosque) {
        handleMosqueExit();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center font-mono">
      <div className="relative w-full max-w-md border-x border-dotted border-border min-h-screen">
        {/* Header */}
        <header className="border-b border-dotted border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary flex items-center justify-center">
                <div className="w-4 h-4 bg-background" />
              </div>
              <span className="font-bold text-lg tracking-tight">MosqueMode</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-primary/10 hover:text-primary"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-8">
          {/* Status Card */}
          <div className="border border-dashed border-border p-6 relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-5 transition-colors duration-500 ${currentMosque ? 'bg-primary' : ''}`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {isMonitoring ? 'System Active' : 'System Paused'}
                  </span>
                </div>
                <Switch
                  checked={isMonitoring}
                  onCheckedChange={toggleMonitoring}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="text-center py-8 space-y-4">
                {currentMosque ? (
                  <>
                    <div className="w-16 h-16 bg-primary text-background mx-auto flex items-center justify-center rounded-none">
                      <VolumeX className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{currentMosque.name}</h2>
                      <p className="text-muted-foreground text-sm">Silent Mode Active</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 border-2 border-primary text-primary mx-auto flex items-center justify-center rounded-none">
                      <Volume2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-2">No Mosque Detected</h2>
                      <p className="text-muted-foreground text-sm">Audio Normal</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 border-dashed hover:border-primary hover:bg-primary/5 rounded-none"
              onClick={() => navigate('/add-mosque')}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Add Mosque</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 border-dashed hover:border-primary hover:bg-primary/5 rounded-none"
              onClick={() => navigate('/mosques')}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Find Nearby</span>
            </Button>
          </div>

          {/* Nearby List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-dotted border-border pb-2">
              <h3 className="font-bold text-sm uppercase tracking-wider">Nearby</h3>
              <span className="text-xs text-muted-foreground">{nearbyMosques.length} found</span>
            </div>
            
            <div className="space-y-3">
              {nearbyMosques.slice(0, 3).map(mosque => (
                <div 
                  key={mosque.id}
                  className="border border-border p-4 hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => navigate(`/mosque/${mosque.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">{mosque.name}</h4>
                      <p 
                        className="text-xs text-muted-foreground mt-1 truncate max-w-[200px] hover:text-primary hover:underline cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/search/?api=1&query=${mosque.latitude},${mosque.longitude}`, '_blank');
                        }}
                      >
                        {mosque.address || "No address"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold bg-muted px-2 py-1">
                      <MapPin className="w-3 h-3" />
                      <span>{Math.round(mosque.distance || 0)}m</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {nearbyMosques.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border">
                  No mosques found nearby
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
