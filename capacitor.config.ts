import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'page.gravitas.app',
  appName: 'Gravitas',
  webDir: 'out',
  server: {
    // For development, point to your local server
    // Use your computer's IP address so emulator can connect
    url: 'http://10.195.2.78:3000',
    cleartext: true
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};


export default config;
