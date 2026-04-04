import { Mail, MessageCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@components/ui/Breadcrumb';

export function SupportPage() {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: t('nav.home'), to: '/' }, { label: t('nav.support') }]} />

      <div>
        <h1
          data-testid="support-title"
          className="text-2xl font-bold text-[var(--text-primary)] mb-2"
        >
          {t('support.title')}
        </h1>
        <p className="text-[var(--text-secondary)]">{t('support.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          data-testid="support-email"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 flex flex-col items-center text-center gap-3"
        >
          <div className="rounded-lg bg-accent/10 p-3">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <h2 className="font-semibold text-[var(--text-primary)]">{t('support.email')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">support@planq.com</p>
        </div>

        <div
          data-testid="support-chat"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 flex flex-col items-center text-center gap-3"
        >
          <div className="rounded-lg bg-accent/10 p-3">
            <MessageCircle className="h-6 w-6 text-accent" />
          </div>
          <h2 className="font-semibold text-[var(--text-primary)]">{t('support.chat')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t('support.chatDesc')}</p>
        </div>

        <div
          data-testid="support-hours"
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 flex flex-col items-center text-center gap-3"
        >
          <div className="rounded-lg bg-accent/10 p-3">
            <Clock className="h-6 w-6 text-accent" />
          </div>
          <h2 className="font-semibold text-[var(--text-primary)]">{t('support.hours')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t('support.hoursDesc')}</p>
        </div>
      </div>
    </div>
  );
}
