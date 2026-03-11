import { Platform } from 'react-native';

const PRODUCTION_URL = 'https://your-production-api.com';

const LAN_IP = '192.168.1.105'; 

const PORT = 5000;

export const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      const isEmulator = !LAN_IP || LAN_IP === '192.168.1.105';
      return `http://10.0.2.2:${PORT}`;
    }
    if (Platform.OS === 'ios') {
      return `http://localhost:${PORT}`;
    }
  }
  return PRODUCTION_URL;
};

export default getBaseUrl;