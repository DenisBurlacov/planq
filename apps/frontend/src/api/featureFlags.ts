import { apiFetch } from './client';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}

export const featureFlagsApi = {
  list: () => apiFetch<FeatureFlag[]>('/api/v1/feature-flags'),

  toggle: (key: string, enabled: boolean) =>
    apiFetch<FeatureFlag>(`/api/v1/admin/feature-flags/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),
};
