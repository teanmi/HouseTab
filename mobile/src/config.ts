import {Platform} from 'react-native';

const LOCAL_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const API_BASE_URL = __DEV__
  ? LOCAL_API_BASE_URL
  : 'https://your-backend.up.railway.app';
