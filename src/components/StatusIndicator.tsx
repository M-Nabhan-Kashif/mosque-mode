import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, MapPin } from "lucide-react";

interface StatusIndicatorProps {
  isActive: boolean;
  isInMosque: boolean;
  currentMosqueName?: string;
}

export const StatusIndicator = ({ isActive, isInMosque, currentMosqueName }: StatusIndicatorProps) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className={`rounded-full p-8 transition-colors ${
          isInMosque ? 'bg-primary/10' : 'bg-accent'
        }`}>
          {isInMosque ? (
            <VolumeX className="w-16 h-16 text-primary" />
          ) : (
            <Volume2 className="w-16 h-16 text-accent-foreground" />
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">
        {isInMosque ? 'Silent Mode Active' : 'Normal Mode'}
      </h2>

      <p className="text-muted mb-4">
        {isInMosque
          ? 'Your phone is silenced while in the mosque'
          : isActive
          ? 'Monitoring nearby mosques'
          : 'Monitoring is paused'}
      </p>

      {isInMosque && currentMosqueName && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium">{currentMosqueName}</span>
        </div>
      )}

      <div className="mt-6">
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? 'Monitoring Active' : 'Monitoring Paused'}
        </Badge>
      </div>
    </Card>
  );
};
