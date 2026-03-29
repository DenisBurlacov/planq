import { apiFetch } from './client';
import type { PromoCode } from '@appTypes/api';

export const promotionsApi = {
  getActive: () => apiFetch<PromoCode[]>('/api/v1/promotions/active'),

  validate: (code: string, orderAmount: number) =>
    apiFetch<{ valid: boolean; discountPercent: number; discountAmount: number }>(
      '/api/v1/promotions/validate',
      { method: 'POST', body: JSON.stringify({ code, orderAmount }) }
    ),
};
