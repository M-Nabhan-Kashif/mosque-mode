import { Geolocation, Position } from '@capacitor/geolocation';
import { Mosque } from '@/types/mosque';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get current device position
 */
export async function getCurrentPosition(): Promise<Position> {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    return position;
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

/**
 * Check if user is within geofence radius of mosque
 */
export function isInGeofence(
  userLat: number,
  userLon: number,
  mosque: Mosque,
  radius: number = 100
): boolean {
  const distance = calculateDistance(userLat, userLon, mosque.latitude, mosque.longitude);
  return distance <= radius;
}

/**
 * Find nearest mosques to user location
 */
import { supabase } from '@/lib/supabase';

/**
 * Find nearest mosques to user location
 * Fetches from Supabase and falls back to local data/cache
 */
export async function findNearbyMosques(
  userLat: number,
  userLon: number,
  localMosques: Mosque[],
  maxDistance: number = 5000 // 5km default
): Promise<Mosque[]> {
  let mosquesToSearch = localMosques;

  try {
    // Fetch verified mosques from Supabase using spatial query
    const { data, error } = await supabase
      .rpc('nearby_mosques', {
        lat: userLat,
        long: userLon,
        radius_meters: maxDistance
      });

    if (!error && data) {
      mosquesToSearch = [...localMosques, ...data];
      // Remove duplicates based on ID
      const uniqueMosques = Array.from(new Map(mosquesToSearch.map(m => [m.id, m])).values());
      mosquesToSearch = uniqueMosques;
    }
  } catch (err) {
    console.error("Failed to fetch mosques from Supabase:", err);
    // Continue with local data
  }

  return mosquesToSearch
    .map(mosque => ({
      ...mosque,
      distance: calculateDistance(userLat, userLon, mosque.latitude, mosque.longitude)
    }))
    .filter(mosque => mosque.distance! <= maxDistance)
    .sort((a, b) => a.distance! - b.distance!);
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const status = await Geolocation.checkPermissions();
    
    if (status.location === 'granted') {
      return true;
    }
    
    const requestResult = await Geolocation.requestPermissions();
    return requestResult.location === 'granted';
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}
