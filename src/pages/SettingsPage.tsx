import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserSettings } from "@/types/mosque";
import { loadSettings, saveSettings, defaultSettings } from "@/utils/storage";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const savedSettings = await loadSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(settings);
      toast.success("Settings saved successfully");
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background font-mono flex justify-center">
      <div className="w-full max-w-md border-x border-dotted border-border min-h-screen">
        {/* Header */}
        <header className="border-b border-dotted border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="hover:bg-primary/10 hover:text-primary -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold uppercase tracking-wider">Settings</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-8">
          {/* General Settings */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-muted-foreground border-b border-dotted border-border pb-2">
              General
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border border-border p-4 hover:border-primary transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="enabled" className="font-bold">Monitoring</Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-silence in mosques
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSetting('enabled', checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between border border-border p-4 hover:border-primary transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="font-bold">Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Alerts on entry/exit
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between border border-border p-4 hover:border-primary transition-colors">
                <div className="space-y-1">
                  <Label htmlFor="backgroundUpdates" className="font-bold">Background Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Find mosques while moving
                  </p>
                  <p className="text-[10px] text-primary font-bold uppercase mt-1">
                    High Battery Usage
                  </p>
                </div>
                <Switch
                  id="backgroundUpdates"
                  checked={settings.backgroundUpdatesEnabled}
                  onCheckedChange={(checked) => updateSetting('backgroundUpdatesEnabled', checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>

          {/* Geofence Settings */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-muted-foreground border-b border-dotted border-border pb-2">
              Detection
            </h2>
            <div className="border border-border p-4 space-y-6 hover:border-primary transition-colors">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Geofence Radius</Label>
                  <span className="text-xs font-bold bg-muted px-2 py-1">
                    {settings.geofenceRadius}m
                  </span>
                </div>
                <Slider
                  value={[settings.geofenceRadius]}
                  onValueChange={([value]) => updateSetting('geofenceRadius', value)}
                  min={50}
                  max={300}
                  step={25}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Distance to trigger silent mode
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed border-border">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Search Radius</Label>
                  <span className="text-xs font-bold bg-muted px-2 py-1">
                    {(settings.searchRadius / 1000).toFixed(1)}km
                  </span>
                </div>
                <Slider
                  value={[settings.searchRadius]}
                  onValueChange={([value]) => updateSetting('searchRadius', value)}
                  min={1000}
                  max={50000}
                  step={1000}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Range to look for mosques
                </p>
              </div>
            </div>
          </div>



          {/* About */}
          <div className="text-center py-8 space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">MosqueMode v1.0.0</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto">
              Respectful worship through automated silence.
            </p>
          </div>

          {/* Save Button */}
          <Button 
            className="w-full rounded-none font-bold uppercase tracking-wider" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
