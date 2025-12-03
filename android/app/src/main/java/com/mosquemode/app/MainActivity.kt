package com.mosquemode.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerPlugin(AudioControlPlugin::class.java)
        registerPlugin(GeofencePlugin::class.java)
    }
}
