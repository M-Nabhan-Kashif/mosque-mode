package com.mosquemode.app

import android.content.Context
import android.media.AudioManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "AudioControl")
class AudioControlPlugin : Plugin() {
    private lateinit var audioManager: AudioManager

    override fun load() {
        audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }

    @PluginMethod
    fun getVolume(call: PluginCall) {
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_RING)
        val volumePercentage = (currentVolume.toFloat() / maxVolume.toFloat() * 100).toInt()
        
        val result = JSObject()
        result.put("volume", volumePercentage)
        call.resolve(result)
    }

    @PluginMethod
    fun setVolume(call: PluginCall) {
        val volume = call.getInt("volume") ?: run {
            call.reject("Volume parameter required")
            return
        }

        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        val targetVolume = (volume.toFloat() / 100 * maxVolume).toInt()
        
        audioManager.setStreamVolume(
            AudioManager.STREAM_RING,
            targetVolume,
            0
        )
        
        call.resolve()
    }

    @PluginMethod
    fun getRingerMode(call: PluginCall) {
        val mode = when (audioManager.ringerMode) {
            AudioManager.RINGER_MODE_SILENT -> "silent"
            AudioManager.RINGER_MODE_VIBRATE -> "vibrate"
            AudioManager.RINGER_MODE_NORMAL -> "normal"
            else -> "normal"
        }
        
        val result = JSObject()
        result.put("mode", mode)
        call.resolve(result)
    }

    @PluginMethod
    fun setRingerMode(call: PluginCall) {
        val mode = call.getString("mode") ?: run {
            call.reject("Mode parameter required")
            return
        }

        val ringerMode = when (mode) {
            "silent" -> AudioManager.RINGER_MODE_SILENT
            "vibrate" -> AudioManager.RINGER_MODE_VIBRATE
            "normal" -> AudioManager.RINGER_MODE_NORMAL
            else -> AudioManager.RINGER_MODE_NORMAL
        }

        audioManager.ringerMode = ringerMode
        call.resolve()
    }

    @PluginMethod
    fun saveAudioSettings(call: PluginCall) {
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_RING)
        val volumePercentage = (currentVolume.toFloat() / maxVolume.toFloat() * 100).toInt()
        
        val mode = when (audioManager.ringerMode) {
            AudioManager.RINGER_MODE_SILENT -> "silent"
            AudioManager.RINGER_MODE_VIBRATE -> "vibrate"
            AudioManager.RINGER_MODE_NORMAL -> "normal"
            else -> "normal"
        }
        
        val result = JSObject()
        result.put("volume", volumePercentage)
        result.put("ringerMode", mode)
        call.resolve(result)
    }

    @PluginMethod
    fun restoreAudioSettings(call: PluginCall) {
        val volume = call.getInt("volume") ?: run {
            call.reject("Volume parameter required")
            return
        }
        
        val mode = call.getString("ringerMode") ?: "normal"

        // Restore volume
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        val targetVolume = (volume.toFloat() / 100 * maxVolume).toInt()
        audioManager.setStreamVolume(AudioManager.STREAM_RING, targetVolume, 0)

        // Restore ringer mode
        val ringerMode = when (mode) {
            "silent" -> AudioManager.RINGER_MODE_SILENT
            "vibrate" -> AudioManager.RINGER_MODE_VIBRATE
            "normal" -> AudioManager.RINGER_MODE_NORMAL
            else -> AudioManager.RINGER_MODE_NORMAL
        }
        audioManager.ringerMode = ringerMode
        
        call.resolve()
    }

    @PluginMethod
    fun applyMosqueMode(call: PluginCall) {
        val streams = intArrayOf(
            AudioManager.STREAM_MUSIC,
            AudioManager.STREAM_ALARM,
            AudioManager.STREAM_NOTIFICATION,
            AudioManager.STREAM_SYSTEM,
            AudioManager.STREAM_RING
        )

        val prefs = context.getSharedPreferences("MosqueModePrefs", Context.MODE_PRIVATE)
        val editor = prefs.edit()

        // Save current volumes
        for (stream in streams) {
            val currentVolume = audioManager.getStreamVolume(stream)
            editor.putInt("stream_$stream", currentVolume)
        }

        // Save ringer mode
        val ringerMode = audioManager.ringerMode
        editor.putInt("ringer_mode", ringerMode)
        
        editor.apply()

        // Apply silent mode
        // We need to be careful with order. Setting ringer mode to silent might affect streams.
        // Best to set volumes to 0 first, then ringer mode if needed.
        // Actually, RINGER_MODE_SILENT mutes notification and ring.
        // We want to explicitly mute everything.
        
        for (stream in streams) {
            try {
                audioManager.setStreamVolume(stream, 0, 0)
            } catch (e: SecurityException) {
                // Some streams might be protected or require DND access
                e.printStackTrace()
            }
        }
        
        // Optionally set ringer mode to silent or vibrate to be sure
        try {
             if (audioManager.ringerMode != AudioManager.RINGER_MODE_SILENT) {
                 audioManager.ringerMode = AudioManager.RINGER_MODE_SILENT
             }
        } catch (e: Exception) {
             e.printStackTrace()
        }

        val result = JSObject()
        result.put("success", true)
        call.resolve(result)
    }

    @PluginMethod
    fun restoreFromMosqueMode(call: PluginCall) {
        val prefs = context.getSharedPreferences("MosqueModePrefs", Context.MODE_PRIVATE)
        
        val streams = intArrayOf(
            AudioManager.STREAM_MUSIC,
            AudioManager.STREAM_ALARM,
            AudioManager.STREAM_NOTIFICATION,
            AudioManager.STREAM_SYSTEM,
            AudioManager.STREAM_RING
        )

        // Restore ringer mode first
        val ringerMode = prefs.getInt("ringer_mode", AudioManager.RINGER_MODE_NORMAL)
        try {
            audioManager.ringerMode = ringerMode
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Restore volumes
        for (stream in streams) {
            val savedVolume = prefs.getInt("stream_$stream", -1)
            if (savedVolume != -1) {
                try {
                    audioManager.setStreamVolume(stream, savedVolume, 0)
                } catch (e: SecurityException) {
                    e.printStackTrace()
                }
            }
        }
        
        call.resolve()
    }

    @PluginMethod
    fun getVibrateMode(call: PluginCall) {
        val enabled = audioManager.ringerMode == AudioManager.RINGER_MODE_VIBRATE
        val result = JSObject()
        result.put("enabled", enabled)
        call.resolve(result)
    }

    @PluginMethod
    fun setVibrateMode(call: PluginCall) {
        val enabled = call.getBoolean("enabled") ?: false
        if (enabled) {
            audioManager.ringerMode = AudioManager.RINGER_MODE_VIBRATE
        }
        call.resolve()
    }

    @PluginMethod
    fun getDNDStatus(call: PluginCall) {
        val enabled = audioManager.ringerMode == AudioManager.RINGER_MODE_SILENT
        val result = JSObject()
        result.put("enabled", enabled)
        call.resolve(result)
    }
}
