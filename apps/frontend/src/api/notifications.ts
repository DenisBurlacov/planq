import { apiFetch } from './client';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  newsletter: boolean;
  marketing: boolean;
}

export const notificationsApi = {
  get: () => apiFetch<NotificationPreferences>('/api/v1/profile/notifications'),

  update: (prefs: NotificationPreferences) =>
    apiFetch<NotificationPreferences>('/api/v1/profile/notifications', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    }),
};
