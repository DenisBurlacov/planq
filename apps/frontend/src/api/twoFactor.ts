import { apiFetch } from './client';
import type { AuthResponse } from '@appTypes/api';

export interface TwoFactorSetup {
  secret: string;
  qrPlaceholder: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
}

export type TwoFactorLoginResponse = AuthResponse;

export const twoFactorApi = {
  enable: () => apiFetch<TwoFactorSetup>('/api/v1/auth/2fa/enable', { method: 'POST' }),

  verifySetup: (code: string) =>
    apiFetch<{ message: string }>('/api/v1/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disable: () => apiFetch<{ message: string }>('/api/v1/auth/2fa/disable', { method: 'POST' }),

  status: () => apiFetch<TwoFactorStatus>('/api/v1/auth/2fa/status'),

  verifyLogin: (tempToken: string, code: string) =>
    apiFetch<TwoFactorLoginResponse>('/api/v1/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    }),
};
