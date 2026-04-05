import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { profileApi } from '@api/profile';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import type { Transaction } from '@appTypes/api';

const schema = z.object({
  amount: z.number().min(0.01, 'Minimum €0.01').max(10000),
  cardNumber: z.string().min(16, 'Enter card number'),
});
type FormData = z.infer<typeof schema>;

const txIcon: Record<Transaction['type'], typeof ArrowDownLeft> = {
  TOPUP: ArrowDownLeft,
  PURCHASE: ArrowUpRight,
  REFUND: RefreshCw,
};

const txColor: Record<Transaction['type'], string> = {
  TOPUP: 'text-green-500',
  PURCHASE: 'text-red-500',
  REFUND: 'text-blue-500',
};

export function WalletPage() {
  const { t } = useTranslation('profile');
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  const { data: txs, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => profileApi.getTransactions(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onTopUp = async (data: FormData) => {
    try {
      const result = await profileApi.topUpWallet(data.amount, data.cardNumber.replace(/\s/g, ''));
      await qc.invalidateQueries({ queryKey: ['profile'] });
      await qc.invalidateQueries({ queryKey: ['transactions'] });
      const updated = await profileApi.get();
      setUser(updated);
      toast(
        'success',
        t('wallet.topUpSuccess', { balance: `€${result.walletBalance.toFixed(2)}` })
      );
      reset();
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('wallet.title')}</h1>
        <div className="text-2xl font-bold text-accent">
          €{profile?.walletBalance.toFixed(2) ?? '0.00'}
        </div>
      </div>

      {/* Top up form */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t('wallet.topUp')}</h2>
        <form onSubmit={handleSubmit(onTopUp)} className="space-y-4">
          <Input
            id="amount"
            label={t('wallet.topUpAmount')}
            type="number"
            placeholder={t('wallet.topUpPlaceholder')}
            min="0.01"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Input
            id="cardNumber"
            label={t('wallet.cardNumber')}
            placeholder="4242 4242 4242 4242"
            error={errors.cardNumber?.message}
            {...register('cardNumber')}
          />
          <Button type="submit" loading={isSubmitting}>
            {t('wallet.topUp')}
          </Button>
        </form>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">
          {t('wallet.transactions')}
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : !txs?.items.length ? (
          <p className="text-center text-[var(--text-secondary)] py-8">
            {t('wallet.noTransactions')}
          </p>
        ) : (
          <div className="space-y-2">
            {txs.items.map(tx => {
              const Icon = txIcon[tx.type];
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                >
                  <div className={`rounded-lg p-2 bg-[var(--bg-sidebar)] ${txColor[tx.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {t(`wallet.types.${tx.type}`)}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-[var(--text-secondary)]">{tx.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${txColor[tx.type]}`}>
                      {tx.type === 'TOPUP' || tx.type === 'REFUND' ? '+' : '-'}€
                      {tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
