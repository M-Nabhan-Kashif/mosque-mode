import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.mosquemode.app',
  appName: 'Mosque Silent Mode',
  webDir: 'dist',

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#00A878",
      showSpinner: false
    }
  }
};

export default config;
