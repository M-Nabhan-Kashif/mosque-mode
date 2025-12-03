import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { Mosque } from "@/types/mosque";
import mosquesData from "@/data/mosques.json";
import { useEffect, useState } from "react";
import { getCurrentPosition, calculateDistance } from "@/utils/location";

const MosqueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [distance, setDistance] = useState<number | undefined>(undefined);

  useEffect(() => {
    // In a real app, we would fetch from API/Supabase if not found locally
    const foundMosque = (mosquesData as Mosque[]).find((m) => m.id === id);
    if (foundMosque) {
      setMosque(foundMosque);
      calculateMosqueDistance(foundMosque);
    }
  }, [id]);

  const calculateMosqueDistance = async (targetMosque: Mosque) => {
      try {
          const position = await getCurrentPosition();
          const dist = calculateDistance(
              position.coords.latitude,
              position.coords.longitude,
              targetMosque.latitude,
              targetMosque.longitude
          );
          setDistance(dist);
      } catch (e) {
          console.error("Error calculating distance", e);
      }
  }

  if (!mosque) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <p className="text-muted-foreground mb-4">Mosque not found</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Mosque Details</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
          <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                  <h2 className="text-3xl font-bold">{mosque.name}</h2>
                  <div 
                    className="flex items-start gap-2 text-muted-foreground mt-3 cursor-pointer hover:text-primary transition-colors inline-flex"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${mosque.latitude},${mosque.longitude}`, '_blank')}
                  >
                      <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-lg underline decoration-dotted">{mosque.address || "No address available"}</span>
                  </div>
              </div>

              {distance !== undefined && (
                  <div className="flex items-center gap-2 text-base font-medium bg-secondary/10 p-3 rounded-md w-fit">
                      <Navigation className="w-5 h-5 text-primary" />
                      <span>{distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`} away</span>
                  </div>
              )}

              <div className="p-6 border rounded-xl bg-card shadow-sm">
                  <h3 className="font-semibold mb-4 text-lg">Location Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <span className="text-muted-foreground text-sm block mb-1">Latitude</span>
                          <span className="font-mono text-lg">{mosque.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                          <span className="text-muted-foreground text-sm block mb-1">Longitude</span>
                          <span className="font-mono text-lg">{mosque.longitude.toFixed(6)}</span>
                      </div>
                  </div>
              </div>
          </div>
      </main>
    </div>
  );
};

export default MosqueDetails;
