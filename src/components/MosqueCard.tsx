import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { Mosque } from "@/types/mosque";

interface MosqueCardProps {
  mosque: Mosque;
}

export const MosqueCard = ({ mosque }: MosqueCardProps) => {
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{mosque.name}</h3>
            {mosque.address && (
              <div className="flex items-start gap-1.5 text-sm text-muted">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{mosque.address}</span>
              </div>
            )}
          </div>
          {mosque.distance !== undefined && (
            <Badge variant="secondary" className="ml-2">
              <Navigation className="w-3 h-3 mr-1" />
              {formatDistance(mosque.distance)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>Lat: {mosque.latitude.toFixed(4)}</span>
          <span>Lon: {mosque.longitude.toFixed(4)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
