import { apiFetch } from './client';
import type { AuthResponse, User } from '@appTypes/api';

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => apiFetch<User>('/api/v1/auth/me'),

  logout: (refreshToken: string) =>
    apiFetch<undefined>('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};
