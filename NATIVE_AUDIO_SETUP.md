# Native Audio Control Plugin Setup

This guide shows you how to implement the native audio control functionality for iOS and Android.

## Prerequisites

1. Make sure you've run:
   ```bash
   npx cap add ios
   npx cap add android
   npx cap sync
   ```

2. Open the native projects:
   - iOS: `npx cap open ios` (requires Xcode on macOS)
   - Android: `npx cap open android` (requires Android Studio)

---

## iOS Implementation (Swift)

### Step 1: Create the Plugin File

In Xcode, navigate to `App/App` in the project navigator.

Create a new Swift file: **File → New → File → Swift File**

Name it: `AudioControlPlugin.swift`

### Step 2: Add the Swift Code

```swift
import Foundation
import Capacitor
import AVFoundation
import MediaPlayer

@objc(AudioControlPlugin)
public class AudioControlPlugin: CAPPlugin {
    
    @objc func getVolume(_ call: CAPPluginCall) {
        let volume = AVAudioSession.sharedInstance().outputVolume
        call.resolve(["volume": Int(volume * 100)])
    }
    
    @objc func setVolume(_ call: CAPPluginCall) {
        guard let volume = call.getInt("volume") else {
            call.reject("Volume parameter required")
            return
        }
        
        let volumeView = MPVolumeView()
        if let slider = volumeView.subviews.first(where: { $0 is UISlider }) as? UISlider {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                slider.value = Float(volume) / 100.0
                call.resolve()
            }
        } else {
            call.reject("Unable to control volume")
        }
    }
    
    @objc func getRingerMode(_ call: CAPPluginCall) {
        // iOS doesn't provide direct access to ringer mode
        // We can check if volume is 0 as an approximation
        let volume = AVAudioSession.sharedInstance().outputVolume
        let mode = volume == 0 ? "silent" : "normal"
        call.resolve(["mode": mode])
    }
    
    @objc func setRingerMode(_ call: CAPPluginCall) {
        guard let mode = call.getString("mode") else {
            call.reject("Mode parameter required")
            return
        }
        
        switch mode {
        case "silent":
            setVolume(CAPPluginCall(callbackId: "", options: ["volume": 0], success: { _ in }, error: { _ in }))
        case "normal":
            setVolume(CAPPluginCall(callbackId: "", options: ["volume": 50], success: { _ in }, error: { _ in }))
        default:
            break
        }
        
        call.resolve()
    }
    
    @objc func saveAudioSettings(_ call: CAPPluginCall) {
        let volume = AVAudioSession.sharedInstance().outputVolume
        let mode = volume == 0 ? "silent" : "normal"
        
        call.resolve([
            "volume": Int(volume * 100),
            "ringerMode": mode
        ])
    }
    
    @objc func restoreAudioSettings(_ call: CAPPluginCall) {
        guard let volume = call.getInt("volume"),
              let mode = call.getString("ringerMode") else {
            call.reject("Volume and ringerMode parameters required")
            return
        }
        
        setVolume(CAPPluginCall(callbackId: "", options: ["volume": volume], success: { _ in }, error: { _ in }))
        call.resolve()
    }
    
    @objc func applyMosqueMode(_ call: CAPPluginCall) {
        let volume = AVAudioSession.sharedInstance().outputVolume
        let mode = volume == 0 ? "silent" : "normal"
        
        // Save current settings
        let previousSettings = [
            "previousVolume": Int(volume * 100),
            "previousRingerMode": mode
        ] as [String : Any]
        
        // Apply silent mode
        setVolume(CAPPluginCall(callbackId: "", options: ["volume": 0], success: { _ in }, error: { _ in }))
        
        call.resolve(previousSettings)
    }
    
    @objc func restoreFromMosqueMode(_ call: CAPPluginCall) {
        guard let volume = call.getInt("volume") else {
            call.reject("Volume parameter required")
            return
        }
        
        setVolume(CAPPluginCall(callbackId: "", options: ["volume": volume], success: { _ in }, error: { _ in }))
        call.resolve()
    }
    
    @objc func getVibrateMode(_ call: CAPPluginCall) {
        call.resolve(["enabled": false])
    }
    
    @objc func setVibrateMode(_ call: CAPPluginCall) {
        call.resolve()
    }
    
    @objc func getDNDStatus(_ call: CAPPluginCall) {
        call.resolve(["enabled": false])
    }
}
```

### Step 3: Register the Plugin

In Xcode, open `ios/App/App/AppDelegate.swift` and add:

```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Register custom plugins
        Capacitor.registerPlugin(AudioControlPlugin.self)
        return true
    }
    
    // ... rest of the file
}
```

---

## Android Implementation (Kotlin)

### Step 1: Create the Plugin File

In Android Studio, navigate to:
`android/app/src/main/java/app/lovable/[your-app-id]/`

Create a new Kotlin file: **Right-click → New → Kotlin Class/File**

Name it: `AudioControlPlugin`

### Step 2: Add the Kotlin Code

```kotlin
package app.lovable.yourappid

import android.content.Context
import android.media.AudioManager
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
        // Save current settings
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_RING)
        val volumePercentage = (currentVolume.toFloat() / maxVolume.toFloat() * 100).toInt()
        
        val mode = when (audioManager.ringerMode) {
            AudioManager.RINGER_MODE_SILENT -> "silent"
            AudioManager.RINGER_MODE_VIBRATE -> "vibrate"
            AudioManager.RINGER_MODE_NORMAL -> "normal"
            else -> "normal"
        }

        // Apply silent mode
        audioManager.ringerMode = AudioManager.RINGER_MODE_SILENT
        audioManager.setStreamVolume(AudioManager.STREAM_RING, 0, 0)

        val result = JSObject()
        result.put("previousVolume", volumePercentage)
        result.put("previousRingerMode", mode)
        call.resolve(result)
    }

    @PluginMethod
    fun restoreFromMosqueMode(call: PluginCall) {
        val volume = call.getInt("volume") ?: run {
            call.reject("Volume parameter required")
            return
        }
        
        val mode = call.getString("ringerMode") ?: "normal"

        // Restore settings
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_RING)
        val targetVolume = (volume.toFloat() / 100 * maxVolume).toInt()
        audioManager.setStreamVolume(AudioManager.STREAM_RING, targetVolume, 0)

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
```

### Step 3: Register the Plugin

Open `android/app/src/main/java/app/lovable/[your-app-id]/MainActivity.kt`

Add the plugin to the imports and onCreate method:

```kotlin
import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Register custom plugins
        registerPlugin(AudioControlPlugin::class.java)
    }
}
```

---

## Required Permissions

### iOS: Update Info.plist

Add these permission descriptions to `ios/App/App/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need access to control audio settings when near mosques</string>
```

### Android: Update AndroidManifest.xml

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

---

## Testing

After implementing the native code:

1. Run `npx cap sync` to sync changes
2. Build and run on device:
   - iOS: `npx cap run ios`
   - Android: `npx cap run android`

3. Test the functionality:
   - Enter a mosque geofence → Phone should silence
   - Leave the geofence → Previous audio settings should restore
   - Check console logs for any errors

---

## Troubleshooting

**iOS:**
- If volume control doesn't work: Check that you're testing on a physical device (simulator has limited audio control)
- Permission denied: Verify Info.plist has the correct keys

**Android:**
- If ringer mode doesn't change: Check that Do Not Disturb permission is granted
- Go to: Settings → Apps → Your App → Permissions → Do Not Disturb access

**Both:**
- Plugin not found: Make sure you ran `npx cap sync` after adding the plugin files
- Build errors: Verify the package name in Android matches your project's package name
