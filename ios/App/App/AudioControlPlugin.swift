import Foundation
import Capacitor
import AVFoundation
import MediaPlayer

@objc(AudioControlPlugin)
@objc(AudioControlPlugin)
public class AudioControlPlugin: CAPPlugin {
    
    public static let shared = AudioControlPlugin()
    
    @objc func getVolume(_ call: CAPPluginCall) {
        let volume = AVAudioSession.sharedInstance().outputVolume
        call.resolve(["volume": Int(volume * 100)])
    }
    
    @objc func setVolume(_ call: CAPPluginCall) {
        guard let volume = call.getInt("volume") else {
            call.reject("Volume parameter required")
            return
        }
        setVolumeInternal(volume: volume)
        call.resolve()
    }
    
    func setVolumeInternal(volume: Int) {
        DispatchQueue.main.async {
            let volumeView = MPVolumeView()
            if let slider = volumeView.subviews.first(where: { $0 is UISlider }) as? UISlider {
                slider.value = Float(volume) / 100.0
            }
        }
    }
    
    @objc func getRingerMode(_ call: CAPPluginCall) {
        let volume = AVAudioSession.sharedInstance().outputVolume
        let mode = volume == 0 ? "silent" : "normal"
        call.resolve(["mode": mode])
    }
    
    @objc func setRingerMode(_ call: CAPPluginCall) {
        guard let mode = call.getString("mode") else {
            call.reject("Mode parameter required")
            return
        }
        
        if mode == "silent" {
            setVolumeInternal(volume: 0)
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
        guard let volume = call.getInt("volume") else {
            call.reject("Volume parameter required")
            return
        }
        setVolumeInternal(volume: volume)
        call.resolve()
    }
    
    @objc func applyMosqueMode(_ call: CAPPluginCall) {
        applyMosqueModeInternal()
        call.resolve(["success": true])
    }
    
    func applyMosqueModeInternal() {
        let volume = AVAudioSession.sharedInstance().outputVolume
        let mode = volume == 0 ? "silent" : "normal"
        
        // Save to UserDefaults for background restoration
        UserDefaults.standard.set(Int(volume * 100), forKey: "previousVolume")
        UserDefaults.standard.set(mode, forKey: "previousRingerMode")
        
        setVolumeInternal(volume: 0)
    }
    
    @objc func restoreFromMosqueMode(_ call: CAPPluginCall) {
        restoreFromMosqueModeInternal()
        call.resolve()
    }
    
    func restoreFromMosqueModeInternal() {
        let volume = UserDefaults.standard.integer(forKey: "previousVolume")
        // Default to 50 if not found or 0
        let targetVolume = volume > 0 ? volume : 50
        setVolumeInternal(volume: targetVolume)
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
