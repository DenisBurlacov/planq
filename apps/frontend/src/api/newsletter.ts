import { apiFetch } from './client';

export const newsletterApi = {
  subscribe: (email: string) =>
    apiFetch<{ message: string }>('/api/v1/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};
