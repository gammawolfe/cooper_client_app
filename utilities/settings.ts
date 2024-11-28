import { Platform } from 'react-native';

interface Settings {
  apiUrl: string;
}

const settings: { dev: Settings; staging?: Settings; prod?: Settings } = {
  dev: {
    // Use 127.0.0.1 for iOS and 10.0.2.2 for Android
    apiUrl: Platform.select({
      ios: "http://127.0.0.1:3000/api/v1",
      android: "http://10.0.2.2:3000/api/v1", // Android emulator uses 10.0.2.2 for localhost
      default: "http://localhost:3000/api/v1",
    }),
  },
  staging: {
    apiUrl: "https://cooperlock.herokuapp.com/api/v1",
  },
  prod: {
    apiUrl: "https://cooperlock.herokuapp.com/api/v1",
  },
};

const getCurrentSettings = (): Settings => {
  const config = __DEV__ ? settings.dev : settings.prod!;
  console.info('[Settings] Using API URL:', config.apiUrl);
  return config;
};

export default getCurrentSettings;
