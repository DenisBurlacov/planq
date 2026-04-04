import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  fallbackTo?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackTo = '/', label, className = '' }: BackButtonProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      type="button"
      role="button"
      data-testid="back-button"
      aria-label="Go back"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label ?? t('back')}
    </button>
  );
}
