import { apiFetch } from './client';

export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  cardholderName: string;
}

export const cardsApi = {
  list: () => apiFetch<SavedCard[]>('/api/v1/cards'),

  add: (input: { cardNumber: string; cardholderName: string; expMonth: number; expYear: number }) =>
    apiFetch<SavedCard>('/api/v1/cards', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  delete: (id: string) => apiFetch<undefined>(`/api/v1/cards/${id}`, { method: 'DELETE' }),

  setDefault: (id: string) => apiFetch<SavedCard>(`/api/v1/cards/${id}/default`, { method: 'PUT' }),
};
