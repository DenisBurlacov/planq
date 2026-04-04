import { apiFetch } from './client';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface AddressInput {
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export const addressesApi = {
  list: () => apiFetch<Address[]>('/api/v1/profile/addresses'),

  create: (data: AddressInput) =>
    apiFetch<Address>('/api/v1/profile/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: AddressInput) =>
    apiFetch<Address>(`/api/v1/profile/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiFetch<undefined>(`/api/v1/profile/addresses/${id}`, { method: 'DELETE' }),

  setDefault: (id: string) =>
    apiFetch<Address>(`/api/v1/profile/addresses/${id}/default`, { method: 'PATCH' }),
};
