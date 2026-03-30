import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button.js';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function Modal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        data-testid="modal"
        className="relative w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 data-testid="modal-title" className="text-lg font-bold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            data-testid="modal-close"
            onClick={onCancel}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div data-testid="modal-body" className="text-sm text-[var(--text-secondary)] mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} data-testid="modal-cancel">
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            data-testid="modal-confirm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
