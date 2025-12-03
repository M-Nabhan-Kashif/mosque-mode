import { registerPlugin } from '@capacitor/core';

export interface GeofenceControlPlugin {
  /**
   * Add a geofence to monitor
   */
  addGeofence(options: { 
    id: string;
    latitude: number;
    longitude: number;
    radius: number;
  }): Promise<void>;

  /**
   * Remove a specific geofence
   */
  removeGeofence(options: { id: string }): Promise<void>;

  /**
   * Clear all monitored geofences
   */
  clearAllGeofences(): Promise<void>;

  /**
   * Start background location updates (battery intensive)
   * @param options.searchRadius Radius in meters to determine update frequency
   */
  startBackgroundUpdates(options?: { searchRadius: number }): Promise<void>;

  /**
   * Stop background location updates
   */
  stopBackgroundUpdates(): Promise<void>;
}

const GeofenceControl = registerPlugin<GeofenceControlPlugin>('GeofenceControl');

export default GeofenceControl;
