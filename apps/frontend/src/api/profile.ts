import { apiFetch } from './client';
import type { User, Transaction, PaginatedResponse } from '@appTypes/api';

export const profileApi = {
  get: () => apiFetch<User>('/api/v1/profile'),

  update: (data: { name?: string; email?: string }) =>
    apiFetch<User>('/api/v1/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  deleteAvatar: () => apiFetch<User>('/api/v1/profile/avatar', { method: 'DELETE' }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<undefined>('/api/v1/profile/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  topUpWallet: (amount: number, cardNumber: string) =>
    apiFetch<{ walletBalance: number }>('/api/v1/profile/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, cardNumber }),
    }),

  getTransactions: (page = 1) =>
    apiFetch<PaginatedResponse<Transaction>>(`/api/v1/profile/wallet?page=${page}`),
};
