import { apiFetch } from './client';
import type { Notification, PaginatedResponse } from '@appTypes/api';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  newsletter: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

export const notificationsApi = {
  get: () => apiFetch<NotificationPreferences>('/api/v1/profile/notifications'),

  update: (prefs: Partial<NotificationPreferences>) =>
    apiFetch<NotificationPreferences>('/api/v1/profile/notifications', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),

  list: (page = 1) =>
    apiFetch<PaginatedResponse<Notification>>(`/api/v1/notifications?page=${page}`),

  unreadCount: () => apiFetch<{ count: number }>('/api/v1/notifications/unread-count'),

  markRead: (id: string) =>
    apiFetch<Notification>(`/api/v1/notifications/${id}/read`, { method: 'PUT' }),

  markAllRead: () => apiFetch<undefined>('/api/v1/notifications/read-all', { method: 'PUT' }),
};
