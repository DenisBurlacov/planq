import { apiFetch } from './client';
import type { AuthResponse, User } from '@appTypes/api';

export interface LoginResponse2FA {
  requires2FA: true;
  tempToken: string;
}

export const authApi = {
  login: (email: string, password: string, captchaToken?: string) =>
    apiFetch<AuthResponse | LoginResponse2FA>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captchaToken }),
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

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: () =>
    apiFetch<{ message: string }>('/api/v1/auth/resend-verification', {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string; token?: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};
