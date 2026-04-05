import { apiFetch } from './client';
import type { AuthResponse } from '@appTypes/api';

export const oauthApi = {
  callback: (provider: 'google' | 'github', code: string) =>
    apiFetch<AuthResponse>('/api/v1/auth/oauth/callback', {
      method: 'POST',
      body: JSON.stringify({ provider, code }),
    }),
};
