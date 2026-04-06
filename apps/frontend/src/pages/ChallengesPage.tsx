import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Star, Crown, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { useChallengesStore } from '@store/challenges.store';
import {
  CHALLENGES,
  TOTAL_CHALLENGES,
  DIFFICULTY_TOTALS,
  type Difficulty,
  type Category,
  type BadgeTier,
} from '@constants/challenges';

type DifficultyFilter = Difficulty | 'all';
type CategoryFilter = Category | 'all';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  junior: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  middle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  senior: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const CATEGORY_COLORS: Record<Category, string> = {
  ui: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  api: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  e2e: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
};

const BADGE_ICONS: Record<Exclude<BadgeTier, 'none'>, typeof Trophy> = {
  bronze: Trophy,
  silver: Medal,
  gold: Star,
  platinum: Crown,
};

const BADGE_COLORS: Record<Exclude<BadgeTier, 'none'>, string> = {
  bronze: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40',
  silver: 'text-slate-500 bg-slate-100 dark:text-slate-300 dark:bg-slate-700/50',
  gold: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/40',
  platinum: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/40',
};

const DIFFICULTIES: Difficulty[] = ['junior', 'middle', 'senior'];

function ProgressBar({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div
      className={`h-2 w-full rounded-full bg-[var(--bg-sidebar)] overflow-hidden ${className ?? ''}`}
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ChallengesPage() {
  const { t } = useTranslation('challenges');
  const { toggle, isCompleted, getProgress, getBadgeTier, totalCompleted } = useChallengesStore();

  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('all');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  const toggleHint = (id: string) => {
    setExpandedHints(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(
    () =>
      CHALLENGES.filter(c => {
        if (diffFilter !== 'all' && c.difficulty !== diffFilter) return false;
        if (catFilter !== 'all' && c.category !== catFilter) return false;
        return true;
      }),
    [diffFilter, catFilter]
  );

  const totalDone = totalCompleted();

  // Collect earned badges
  const earnedBadges = DIFFICULTIES.map(d => ({
    difficulty: d,
    tier: getBadgeTier(d),
  })).filter(b => b.tier !== 'none');

  return (
    <div data-testid="challenges-page" className="py-8 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1
          data-testid="challenges-title"
          className="text-3xl font-bold text-[var(--text-primary)] mb-2"
        >
          {t('page.title')}
        </h1>
        <p className="text-[var(--text-secondary)] mb-4">{t('page.subtitle')}</p>
        <div data-testid="challenges-overall-progress" className="mb-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {t('page.overallProgress', { done: totalDone, total: TOTAL_CHALLENGES })}
          </span>
        </div>
        <ProgressBar done={totalDone} total={TOTAL_CHALLENGES} />
      </div>

      {/* Badge showcase */}
      <div data-testid="challenges-badges" className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          {t('page.badges')}
        </h2>
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">{t('page.noBadges')}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map(({ difficulty, tier }) => {
              const Icon = BADGE_ICONS[tier as Exclude<BadgeTier, 'none'>];
              const colorClass = BADGE_COLORS[tier as Exclude<BadgeTier, 'none'>];
              return (
                <div
                  key={difficulty}
                  data-testid={`badge-${difficulty}-${tier}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium capitalize">
                    {t(`page.filters.${difficulty}`)} {t(`page.badgeTier.${tier}`)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Difficulty filter tabs */}
      <div data-testid="challenges-difficulty-filter" className="flex flex-wrap gap-2 mb-4">
        {(['all', 'junior', 'middle', 'senior'] as DifficultyFilter[]).map(d => {
          const count = d === 'all' ? TOTAL_CHALLENGES : DIFFICULTY_TOTALS[d];
          const isActive = diffFilter === d;
          return (
            <button
              key={d}
              data-testid={`filter-difficulty-${d}`}
              onClick={() => setDiffFilter(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t(`page.filters.${d}`)} ({count})
            </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div data-testid="challenges-category-filter" className="flex flex-wrap gap-2 mb-6">
        {(['all', 'ui', 'api', 'e2e'] as CategoryFilter[]).map(c => {
          const isActive = catFilter === c;
          return (
            <button
              key={c}
              data-testid={`filter-category-${c}`}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t(`page.filters.${c}`)}
            </button>
          );
        })}
      </div>

      {/* Per-difficulty progress bars */}
      {(diffFilter === 'all' ? DIFFICULTIES : [diffFilter as Difficulty]).map(d => {
        const { done, total } = getProgress(d);
        return (
          <div key={d} data-testid={`progress-${d}`} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--text-primary)] capitalize">
                {t(`page.filters.${d}`)}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {t('page.progress', { done, total })}
              </span>
            </div>
            <ProgressBar done={done} total={total} />
          </div>
        );
      })}

      {/* Challenge list */}
      <div data-testid="challenges-list" className="space-y-3 mt-6">
        {filtered.map(challenge => {
          const done = isCompleted(challenge.id);
          const hintKey = `${challenge.id}.hint`;
          const hintText = t(hintKey, { defaultValue: '' });
          const hasHint = hintText !== '' && hintText !== hintKey;
          const hintExpanded = expandedHints.has(challenge.id);

          return (
            <div
              key={challenge.id}
              data-testid={`challenge-${challenge.id}`}
              className={`flex gap-3 p-4 rounded-xl border transition-colors ${
                done
                  ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800/40'
                  : 'bg-[var(--bg-card)] border-[var(--border)]'
              }`}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0 pt-0.5">
                <button
                  data-testid={`challenge-checkbox-${challenge.id}`}
                  onClick={() => toggle(challenge.id)}
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    done
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-[var(--border)] hover:border-accent'
                  }`}
                  aria-label={done ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {done && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    data-testid={`challenge-title-${challenge.id}`}
                    className={`font-medium text-[var(--text-primary)] ${done ? 'line-through opacity-60' : ''}`}
                  >
                    {t(`${challenge.id}.title`)}
                  </span>
                  <span
                    data-testid={`challenge-difficulty-${challenge.id}`}
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[challenge.difficulty]}`}
                  >
                    {t(`page.filters.${challenge.difficulty}`)}
                  </span>
                  <span
                    data-testid={`challenge-category-${challenge.id}`}
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase ${CATEGORY_COLORS[challenge.category]}`}
                  >
                    {challenge.category}
                  </span>
                </div>

                <p className={`text-sm text-[var(--text-secondary)] ${done ? 'opacity-60' : ''}`}>
                  {t(`${challenge.id}.description`)}
                </p>

                {hasHint && (
                  <div className="mt-2">
                    <button
                      data-testid={`challenge-hint-toggle-${challenge.id}`}
                      onClick={() => toggleHint(challenge.id)}
                      className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      {hintExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {hintExpanded ? t('page.hideHint') : t('page.showHint')}
                    </button>
                    {hintExpanded && (
                      <div
                        data-testid={`challenge-hint-${challenge.id}`}
                        className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg"
                      >
                        <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>{hintText}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
