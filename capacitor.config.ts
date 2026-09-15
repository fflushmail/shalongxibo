import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:   'com.shalongxibo.app',
  appName: '沙龙希伯',
  webDir:  'dist',

  // ── Android-specific settings ─────────────────────────────────────────────
  android: {
    // Allow cleartext HTTP for local dev; production uses HTTPS
    allowMixedContent: false,
    // Back-button closes the app from the root view
    handleApplicationNotifications: true,
  },

  // ── Server / live reload (dev only — remove for production APK) ────────────
  // Uncomment to enable live reload during development:
  // server: {
  //   url: 'http://192.168.x.x:5173',
  //   cleartext: true,
  // },

  plugins: {
    // Status bar: match app theme color
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1A4B8C',
    },
    // Splash screen: auto-hide after app loads
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F5F0E8',
      showSpinner: false,
      androidSpinnerStyle: 'small',
    },
  },
}

export default config
