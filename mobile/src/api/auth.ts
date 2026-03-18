import { API_BASE_URL } from '../config';
import { requestJson } from './client';

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type MeResponse = {
  user: User;
};

export const authApi = {
  login(email: string, password: string) {
    return requestJson<AuthResponse>(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  register(name: string, email: string, password: string) {
    return requestJson<AuthResponse>(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  },

  getMe(token: string) {
    return requestJson<MeResponse>(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  refreshToken(token: string) {
    return requestJson<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
