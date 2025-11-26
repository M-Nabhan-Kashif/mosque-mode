import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MosqueCard } from "@/components/MosqueCard";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Mosque } from "@/types/mosque";
import { getCurrentPosition, findNearbyMosques } from "@/utils/location";
import mosquesData from "@/data/mosques.json";

const MosqueList = () => {
  const navigate = useNavigate();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMosques();
  }, []);

  const loadMosques = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const allMosques = mosquesData as Mosque[];
      const nearby = findNearbyMosques(latitude, longitude, allMosques, 50000); // 50km radius
      setMosques(nearby);
    } catch (error) {
      console.error("Failed to load mosques:", error);
      setMosques(mosquesData as Mosque[]);
    }
  };

  const filteredMosques = mosques.filter(mosque => 
    mosque.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mosque.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">All Mosques</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input 
              placeholder="Search mosques by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <div>
            <p className="text-sm text-muted mb-4">
              Showing {filteredMosques.length} {filteredMosques.length === 1 ? 'mosque' : 'mosques'}
            </p>
            
            <div className="space-y-3">
              {filteredMosques.map(mosque => (
                <MosqueCard key={mosque.id} mosque={mosque} />
              ))}
            </div>

            {filteredMosques.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted">No mosques found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MosqueList;
