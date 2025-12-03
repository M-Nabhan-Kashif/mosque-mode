export interface Mosque {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  placeId?: string;
  lastVerified?: Date;
  distance?: number; // Distance from user in meters
}

export interface UserSettings {
  enabled: boolean;
  geofenceRadius: number; // in meters
  searchRadius: number; // in meters
  notificationsEnabled: boolean;
  backgroundUpdatesEnabled: boolean;
  previousVolume?: number;
  previousVibrateMode?: boolean;
}

export interface MonitoringState {
  isActive: boolean;
  isInMosque: boolean;
  currentMosque?: Mosque;
  nearbyMosques: Mosque[];
  lastUpdate: Date;
}

export interface AudioSettings {
  volume: number;
  ringerMode: 'silent' | 'vibrate' | 'normal';
}
