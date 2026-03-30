import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      isDark: false,
      toggle: () =>
        set(state => {
          const next = !state.isDark;
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),
    }),
    { name: 'planq-theme' }
  )
);

// Apply theme on load
const stored = localStorage.getItem('planq-theme');
if (stored) {
  try {
    const parsed = JSON.parse(stored) as { state?: { isDark?: boolean } };
    if (parsed.state?.isDark) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // ignore
  }
}
