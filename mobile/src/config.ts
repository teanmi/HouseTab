import { Platform } from 'react-native';

const LOCAL_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://192.168.4.71:3000',
  default: 'http://localhost:3000',
});

const PROD_API_BASE_URL = 'https://api.housetabapp.com';

export const API_BASE_URL = (
  __DEV__ ? LOCAL_API_BASE_URL : PROD_API_BASE_URL
).replace(/\/+$/, '');
