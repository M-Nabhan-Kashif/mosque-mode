package com.mosquemode.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.LocationServices

class LocationForegroundService : Service() {

    private val CHANNEL_ID = "MosqueModeLocationChannel"
    private val NOTIFICATION_ID = 12345
    private var currentIntent: Intent? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        currentIntent = intent
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        startLocationUpdates()

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopLocationUpdates()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Mosque Mode Location Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("MosqueMode Active")
            .setContentText("Monitoring location for nearby mosques")
            .setSmallIcon(R.mipmap.ic_launcher) // Make sure this icon exists
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun startLocationUpdates() {
        // Get search radius from intent, default to 5000m
        val searchRadius = currentIntent?.getDoubleExtra("searchRadius", 5000.0) ?: 5000.0
        val displacement = (searchRadius / 2).toFloat()

        val locationRequest = com.google.android.gms.location.LocationRequest.create().apply {
            interval = 15 * 60 * 1000 // 15 minutes
            fastestInterval = 5 * 60 * 1000 // 5 minutes
            priority = com.google.android.gms.location.LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY
            smallestDisplacement = displacement
        }

        val locationPendingIntent = PendingIntent.getBroadcast(
            this,
            1,
            Intent(this, GeofenceBroadcastReceiver::class.java).apply {
                action = "com.mosquemode.app.LOCATION_UPDATE"
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )

        try {
            LocationServices.getFusedLocationProviderClient(this)
                .requestLocationUpdates(locationRequest, locationPendingIntent)
        } catch (e: SecurityException) {
            // Handle permission error
        }
    }

    private fun stopLocationUpdates() {
        val locationPendingIntent = PendingIntent.getBroadcast(
            this,
            1,
            Intent(this, GeofenceBroadcastReceiver::class.java).apply {
                action = "com.mosquemode.app.LOCATION_UPDATE"
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )

        LocationServices.getFusedLocationProviderClient(this)
            .removeLocationUpdates(locationPendingIntent)
    }
}
