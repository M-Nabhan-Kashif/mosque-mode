export interface Mosque {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  lastVerified?: Date;
  distance?: number; // Distance from user in meters
}

export interface UserSettings {
  enabled: boolean;
  geofenceRadius: number; // in meters
  notificationsEnabled: boolean;
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
