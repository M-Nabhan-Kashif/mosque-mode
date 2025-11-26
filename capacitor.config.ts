import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.02e03eeed3a24d2fb9eefc63987225fd',
  appName: 'Mosque Silent Mode',
  webDir: 'dist',
  server: {
    url: 'https://02e03eee-d3a2-4d2f-b9ee-fc63987225fd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#00A878",
      showSpinner: false
    }
  }
};

export default config;
