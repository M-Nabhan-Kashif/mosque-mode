package com.mosquemode.app

import android.Manifest
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices

@CapacitorPlugin(
    name = "GeofenceControl",
    permissions = [
        Permission(
            alias = "location",
            strings = [
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ]
        )
    ]
)
class GeofencePlugin : Plugin() {
    private lateinit var geofencingClient: GeofencingClient
    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
        PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)
    }

    override fun load() {
        geofencingClient = LocationServices.getGeofencingClient(context)
    }

    @PluginMethod
    fun addGeofence(call: PluginCall) {
        val id = call.getString("id")
        val latitude = call.getDouble("latitude")
        val longitude = call.getDouble("longitude")
        val radius = call.getDouble("radius")

        if (id == null || latitude == null || longitude == null || radius == null) {
            call.reject("Missing parameters")
            return
        }

        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            call.reject("Location permission not granted")
            return
        }

        val geofence = Geofence.Builder()
            .setRequestId(id)
            .setCircularRegion(latitude, longitude, radius.toFloat())
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
            .build()

        val geofencingRequest = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(geofence)
            .build()

        geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent).run {
            addOnSuccessListener {
                call.resolve()
            }
            addOnFailureListener {
                call.reject("Failed to add geofence: ${it.message}")
            }
        }
    }

    @PluginMethod
    fun removeGeofence(call: PluginCall) {
        val id = call.getString("id")
        if (id == null) {
            call.reject("Missing id parameter")
            return
        }

        geofencingClient.removeGeofences(listOf(id)).run {
            addOnSuccessListener {
                call.resolve()
            }
            addOnFailureListener {
                call.reject("Failed to remove geofence")
            }
        }
    }

    @PluginMethod
    fun clearAllGeofences(call: PluginCall) {
        geofencingClient.removeGeofences(geofencePendingIntent).run {
            addOnSuccessListener {
                call.resolve()
            }
            addOnFailureListener {
                call.reject("Failed to clear geofences")
            }
        }
    }

    @PluginMethod
    fun startBackgroundUpdates(call: PluginCall) {
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            call.reject("Location permission not granted")
            return
        }

        val searchRadius = call.getDouble("searchRadius") ?: 5000.0

        val intent = Intent(context, LocationForegroundService::class.java).apply {
            putExtra("searchRadius", searchRadius)
        }
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
        call.resolve()
    }

    @PluginMethod
    fun stopBackgroundUpdates(call: PluginCall) {
        val intent = Intent(context, LocationForegroundService::class.java)
        context.stopService(intent)
        call.resolve()
    }
}
