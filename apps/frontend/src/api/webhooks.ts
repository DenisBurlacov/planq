import { apiFetch } from './client';

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  deliveries: WebhookDelivery[];
}

export const webhooksApi = {
  list: () => apiFetch<WebhookSubscription[]>('/api/v1/webhooks'),

  create: (url: string, events: string[]) =>
    apiFetch<WebhookSubscription>('/api/v1/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url, events }),
    }),

  toggle: (id: string, active: boolean) =>
    apiFetch<WebhookSubscription>(`/api/v1/webhooks/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    }),

  remove: (id: string) => apiFetch<undefined>(`/api/v1/webhooks/${id}`, { method: 'DELETE' }),

  deliveries: (id: string) => apiFetch<WebhookDelivery[]>(`/api/v1/webhooks/${id}/deliveries`),
};
