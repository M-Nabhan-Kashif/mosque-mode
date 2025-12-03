package com.mosquemode.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.util.Log
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent

class GeofenceBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent)
        if (geofencingEvent == null || geofencingEvent.hasError()) {
            Log.e("GeofenceReceiver", "Error receiving geofence event")
            return
        }

        val geofenceTransition = geofencingEvent.geofenceTransition

        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER) {
            Log.d("GeofenceReceiver", "Entering mosque geofence")
            applyMosqueMode(context)
        } else if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {
            Log.d("GeofenceReceiver", "Exiting mosque geofence")
            restoreFromMosqueMode(context)
        }
    }

    private fun applyMosqueMode(context: Context) {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val prefs = context.getSharedPreferences("MosqueModePrefs", Context.MODE_PRIVATE)

        // Save current settings if not already saved (to avoid overwriting with silent mode)
        if (!prefs.contains("previous_ringer_mode")) {
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_RING)
            val currentRingerMode = audioManager.ringerMode
            
            prefs.edit()
                .putInt("previous_volume", currentVolume)
                .putInt("previous_ringer_mode", currentRingerMode)
                .apply()
        }

        // Silence the phone
        audioManager.ringerMode = AudioManager.RINGER_MODE_SILENT
        audioManager.setStreamVolume(AudioManager.STREAM_RING, 0, 0)
    }

    private fun restoreFromMosqueMode(context: Context) {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val prefs = context.getSharedPreferences("MosqueModePrefs", Context.MODE_PRIVATE)

        if (prefs.contains("previous_ringer_mode")) {
            val previousVolume = prefs.getInt("previous_volume", 0)
            val previousRingerMode = prefs.getInt("previous_ringer_mode", AudioManager.RINGER_MODE_NORMAL)

            // Restore settings
            audioManager.setStreamVolume(AudioManager.STREAM_RING, previousVolume, 0)
            audioManager.ringerMode = previousRingerMode

            // Clear saved settings
            prefs.edit()
                .remove("previous_volume")
                .remove("previous_ringer_mode")
                .apply()
        } else {
            // Fallback if no settings saved: just set to normal
            audioManager.ringerMode = AudioManager.RINGER_MODE_NORMAL
        }
    }
}
