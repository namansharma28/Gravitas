import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'page.gravitas.app',
  appName: 'Gravitas',
  webDir: 'out',
  server: {
    url: 'https://www.gravitas.page',
    cleartext: false
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
