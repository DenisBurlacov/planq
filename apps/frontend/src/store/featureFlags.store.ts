import { create } from 'zustand';
import { featureFlagsApi, type FeatureFlag } from '@api/featureFlags';

interface FeatureFlagsState {
  flags: Record<string, boolean>;
  allFlags: FeatureFlag[];
  loaded: boolean;
  fetchFlags: () => Promise<void>;
}

export const useFeatureFlagsStore = create<FeatureFlagsState>()(set => ({
  flags: {},
  allFlags: [],
  loaded: false,
  fetchFlags: async () => {
    try {
      const list = await featureFlagsApi.list();
      const map: Record<string, boolean> = {};
      for (const f of list) {
        map[f.key] = f.enabled;
      }
      set({ flags: map, allFlags: list, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
