import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { useToast } from '@components/ui/Toast';
import { productsApi } from '@api/products';
import { ApiException } from '@api/client';

interface NotifyWhenInStockProps {
  productId: string;
}

export function NotifyWhenInStock({ productId }: NotifyWhenInStockProps) {
  const { t } = useTranslation('catalog');
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await productsApi.notifyInStock(productId, email.trim());
      toast('success', t('product.notifySuccess'));
      setEmail('');
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('product.notifyFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
        <input
          data-testid="notify-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('product.notifyPlaceholder')}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <Button data-testid="notify-submit" type="submit" loading={submitting} size="md">
        {t('product.notifyMe')}
      </Button>
    </form>
  );
}
