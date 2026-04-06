import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CHALLENGES,
  DIFFICULTY_TOTALS,
  type BadgeTier,
  type Difficulty,
} from '@constants/challenges';

interface ChallengesState {
  completed: string[];
  toggle: (id: string) => void;
  isCompleted: (id: string) => boolean;
  getProgress: (difficulty: Difficulty) => { done: number; total: number };
  getBadgeTier: (difficulty: Difficulty) => BadgeTier;
  totalCompleted: () => number;
}

function tierFromPercent(pct: number): BadgeTier {
  if (pct >= 100) return 'platinum';
  if (pct >= 75) return 'gold';
  if (pct >= 50) return 'silver';
  if (pct >= 25) return 'bronze';
  return 'none';
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      completed: [],

      toggle: (id: string) =>
        set(state => {
          const idx = state.completed.indexOf(id);
          if (idx >= 0) {
            return { completed: state.completed.filter(c => c !== id) };
          }
          return { completed: [...state.completed, id] };
        }),

      isCompleted: (id: string) => get().completed.includes(id),

      getProgress: (difficulty: Difficulty) => {
        const ids = CHALLENGES.filter(c => c.difficulty === difficulty).map(c => c.id);
        const done = get().completed.filter(id => ids.includes(id)).length;
        return { done, total: DIFFICULTY_TOTALS[difficulty] };
      },

      getBadgeTier: (difficulty: Difficulty) => {
        const { done, total } = get().getProgress(difficulty);
        return tierFromPercent((done / total) * 100);
      },

      totalCompleted: () => get().completed.length,
    }),
    { name: 'planq-challenges-progress' }
  )
);
