import { useFeatureFlagsStore } from '@store/featureFlags.store';

export function useFeatureFlag(key: string): boolean {
  return useFeatureFlagsStore(s => s.flags[key] ?? false);
}
