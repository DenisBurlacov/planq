import { apiFetch } from './client';

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
};
