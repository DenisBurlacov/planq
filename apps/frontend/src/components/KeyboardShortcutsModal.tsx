import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const { t } = useTranslation('common');

  if (!open) return null;

  const shortcuts = [
    { key: t('keyboardShortcuts.shortcut.ctrlK'), description: t('keyboardShortcuts.search') },
    { key: t('keyboardShortcuts.shortcut.questionMark'), description: t('keyboardShortcuts.help') },
  ];

  return (
    <div
      data-testid="keyboard-shortcuts-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        data-testid="keyboard-shortcuts-modal"
        className="w-full max-w-sm rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            data-testid="keyboard-shortcuts-title"
            className="text-lg font-bold text-[var(--text-primary)]"
          >
            {t('keyboardShortcuts.title')}
          </h2>
          <button
            data-testid="keyboard-shortcuts-close"
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map(s => (
            <div
              key={s.key}
              data-testid="keyboard-shortcut-item"
              className="flex items-center justify-between"
            >
              <span className="text-sm text-[var(--text-secondary)]">{s.description}</span>
              <kbd className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-sidebar)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
