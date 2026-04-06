export interface Challenge {
  id: string;
  difficulty: 'junior' | 'middle' | 'senior';
  category: 'ui' | 'api' | 'e2e';
}

export type Difficulty = Challenge['difficulty'];
export type Category = Challenge['category'];
export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export const CHALLENGES: Challenge[] = [
  // ── Junior: UI (15) ──────────────────────────────
  { id: 'j-01', difficulty: 'junior', category: 'ui' },
  { id: 'j-02', difficulty: 'junior', category: 'ui' },
  { id: 'j-03', difficulty: 'junior', category: 'ui' },
  { id: 'j-04', difficulty: 'junior', category: 'ui' },
  { id: 'j-05', difficulty: 'junior', category: 'ui' },
  { id: 'j-06', difficulty: 'junior', category: 'ui' },
  { id: 'j-07', difficulty: 'junior', category: 'ui' },
  { id: 'j-08', difficulty: 'junior', category: 'ui' },
  { id: 'j-09', difficulty: 'junior', category: 'ui' },
  { id: 'j-10', difficulty: 'junior', category: 'ui' },
  { id: 'j-11', difficulty: 'junior', category: 'ui' },
  { id: 'j-12', difficulty: 'junior', category: 'ui' },
  { id: 'j-13', difficulty: 'junior', category: 'ui' },
  { id: 'j-14', difficulty: 'junior', category: 'ui' },
  { id: 'j-15', difficulty: 'junior', category: 'ui' },

  // ── Junior: API (10) ─────────────────────────────
  { id: 'j-16', difficulty: 'junior', category: 'api' },
  { id: 'j-17', difficulty: 'junior', category: 'api' },
  { id: 'j-18', difficulty: 'junior', category: 'api' },
  { id: 'j-19', difficulty: 'junior', category: 'api' },
  { id: 'j-20', difficulty: 'junior', category: 'api' },
  { id: 'j-21', difficulty: 'junior', category: 'api' },
  { id: 'j-22', difficulty: 'junior', category: 'api' },
  { id: 'j-23', difficulty: 'junior', category: 'api' },
  { id: 'j-24', difficulty: 'junior', category: 'api' },
  { id: 'j-25', difficulty: 'junior', category: 'api' },

  // ── Middle: UI (10) ──────────────────────────────
  { id: 'm-01', difficulty: 'middle', category: 'ui' },
  { id: 'm-02', difficulty: 'middle', category: 'ui' },
  { id: 'm-03', difficulty: 'middle', category: 'ui' },
  { id: 'm-04', difficulty: 'middle', category: 'ui' },
  { id: 'm-05', difficulty: 'middle', category: 'ui' },
  { id: 'm-06', difficulty: 'middle', category: 'ui' },
  { id: 'm-07', difficulty: 'middle', category: 'ui' },
  { id: 'm-08', difficulty: 'middle', category: 'ui' },
  { id: 'm-09', difficulty: 'middle', category: 'ui' },
  { id: 'm-10', difficulty: 'middle', category: 'ui' },

  // ── Middle: API (8) ──────────────────────────────
  { id: 'm-11', difficulty: 'middle', category: 'api' },
  { id: 'm-12', difficulty: 'middle', category: 'api' },
  { id: 'm-13', difficulty: 'middle', category: 'api' },
  { id: 'm-14', difficulty: 'middle', category: 'api' },
  { id: 'm-15', difficulty: 'middle', category: 'api' },
  { id: 'm-16', difficulty: 'middle', category: 'api' },
  { id: 'm-17', difficulty: 'middle', category: 'api' },
  { id: 'm-18', difficulty: 'middle', category: 'api' },

  // ── Middle: E2E (7) ──────────────────────────────
  { id: 'm-19', difficulty: 'middle', category: 'e2e' },
  { id: 'm-20', difficulty: 'middle', category: 'e2e' },
  { id: 'm-21', difficulty: 'middle', category: 'e2e' },
  { id: 'm-22', difficulty: 'middle', category: 'e2e' },
  { id: 'm-23', difficulty: 'middle', category: 'e2e' },
  { id: 'm-24', difficulty: 'middle', category: 'e2e' },
  { id: 'm-25', difficulty: 'middle', category: 'e2e' },

  // ── Senior: UI (7) ──────────────────────────────
  { id: 's-01', difficulty: 'senior', category: 'ui' },
  { id: 's-02', difficulty: 'senior', category: 'ui' },
  { id: 's-03', difficulty: 'senior', category: 'ui' },
  { id: 's-04', difficulty: 'senior', category: 'ui' },
  { id: 's-05', difficulty: 'senior', category: 'ui' },
  { id: 's-06', difficulty: 'senior', category: 'ui' },
  { id: 's-07', difficulty: 'senior', category: 'ui' },

  // ── Senior: API (8) ─────────────────────────────
  { id: 's-08', difficulty: 'senior', category: 'api' },
  { id: 's-09', difficulty: 'senior', category: 'api' },
  { id: 's-10', difficulty: 'senior', category: 'api' },
  { id: 's-11', difficulty: 'senior', category: 'api' },
  { id: 's-12', difficulty: 'senior', category: 'api' },
  { id: 's-13', difficulty: 'senior', category: 'api' },
  { id: 's-14', difficulty: 'senior', category: 'api' },
  { id: 's-15', difficulty: 'senior', category: 'api' },

  // ── Senior: E2E (5) ─────────────────────────────
  { id: 's-16', difficulty: 'senior', category: 'e2e' },
  { id: 's-17', difficulty: 'senior', category: 'e2e' },
  { id: 's-18', difficulty: 'senior', category: 'e2e' },
  { id: 's-19', difficulty: 'senior', category: 'e2e' },
  { id: 's-20', difficulty: 'senior', category: 'e2e' },
];

export const DIFFICULTY_TOTALS: Record<Difficulty, number> = {
  junior: CHALLENGES.filter(c => c.difficulty === 'junior').length,
  middle: CHALLENGES.filter(c => c.difficulty === 'middle').length,
  senior: CHALLENGES.filter(c => c.difficulty === 'senior').length,
};

export const TOTAL_CHALLENGES = CHALLENGES.length;
