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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Configure app behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable Monitoring</Label>
                  <p className="text-sm text-muted">
                    Automatically detect mosques and silence phone
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSetting('enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted">
                    Show alerts when entering/leaving mosques
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Geofence Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Radius</CardTitle>
              <CardDescription>
                Distance from mosque to trigger silent mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Radius</Label>
                  <span className="text-sm font-medium">
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
                <p className="text-xs text-muted">
                  Recommended: 100m for optimal accuracy
                </p>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted">
              <p>Version 1.0.0</p>
              <p>
                This app automatically silences your phone when you enter a mosque
                and restores your previous audio settings when you leave.
              </p>
              <p className="text-xs mt-4">
                Location permissions are required for mosque detection.
                All data is stored locally on your device.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
