import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { useToast } from '@components/ui/Toast';
import { useConfirmModal } from '@hooks/useConfirmModal';

export interface PaymentMethodsTabProps {
  profileName: string;
}

export function PaymentMethodsTab({ profileName }: PaymentMethodsTabProps) {
  const { t } = useTranslation('profile');
  const { toast } = useToast();
  const [cards, setCards] = useState<import('@api/cards').SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const deleteCardConfirm = useConfirmModal<string>();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expMonth, setExpMonth] = useState(new Date().getMonth() + 1);
  const [expYear, setExpYear] = useState(new Date().getFullYear() + 1);
  const [saving, setSaving] = useState(false);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const loadCards = useCallback(async () => {
    const { cardsApi } = await import('@api/cards');
    const result = await cardsApi.list();
    setCards(result);
    setLoading(false);
  }, []);

  useState(() => {
    loadCards();
  });

  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, '');
    if (!digits) {
      errs.cardNumber = t('paymentMethods.validation.cardRequired');
    } else if (!/^\d{13,19}$/.test(digits)) {
      errs.cardNumber = t('paymentMethods.validation.cardInvalid');
    }
    if (!cardholderName.trim()) {
      errs.cardholderName = t('paymentMethods.validation.nameRequired');
    } else if (cardholderName.trim().length < 2) {
      errs.cardholderName = t('paymentMethods.validation.nameMin');
    } else if (cardholderName.trim().length > 15) {
      errs.cardholderName = t('paymentMethods.validation.nameMax');
    } else if (!/^[a-zA-Z\s\-']+$/.test(cardholderName.trim())) {
      errs.cardholderName = t('paymentMethods.validation.nameLatinOnly');
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      errs.expiry = t('paymentMethods.validation.expiryPast');
    }
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async () => {
    if (!validateCard()) return;
    setSaving(true);
    try {
      const { cardsApi } = await import('@api/cards');
      await cardsApi.add({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardholderName.trim(),
        expMonth,
        expYear,
      });
      toast('success', t('toast.cardAdded'));
      setAddModalOpen(false);
      setCardNumber('');
      setCardholderName('');
      await loadCards();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : t('paymentMethods.maxCards'));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteCardConfirm.target) return;
    const { cardsApi } = await import('@api/cards');
    await cardsApi.delete(deleteCardConfirm.target);
    toast('success', t('toast.cardDeleted'));
    deleteCardConfirm.close();
    await loadCards();
  };

  const handleSetDefault = async (id: string) => {
    const { cardsApi } = await import('@api/cards');
    await cardsApi.setDefault(id);
    toast('success', t('toast.defaultCardUpdated'));
    await loadCards();
  };

  const brandIcon = (brand: string) => {
    const colors: Record<string, string> = {
      Visa: 'text-blue-600',
      Mastercard: 'text-orange-500',
      Amex: 'text-blue-400',
    };
    return <span className={`text-xs font-bold ${colors[brand] || ''}`}>{brand}</span>;
  };

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div
      data-testid="tab-panel-payment-methods"
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[var(--text-primary)]">{t('paymentMethods.title')}</h2>
          <span
            data-testid="card-count"
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              cards.length >= 5
                ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)]'
            }`}
          >
            {cards.length}/5
          </span>
        </div>
        {cards.length < 5 && (
          <Button
            data-testid="add-card-button"
            size="sm"
            onClick={() => {
              setCardholderName(profileName);
              setAddModalOpen(true);
            }}
            disabled={cards.length >= 5}
          >
            <CreditCard className="h-4 w-4" /> {t('paymentMethods.addCard')}
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-20" />
      ) : cards.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="h-8 w-8 mx-auto text-[var(--text-secondary)] mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">{t('paymentMethods.empty')}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {t('paymentMethods.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => (
            <div
              key={card.id}
              data-testid={`saved-card-${card.id}`}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[var(--text-secondary)]" />
                <div>
                  <div className="flex items-center gap-2">
                    {brandIcon(card.brand)}
                    <span className="text-sm text-[var(--text-primary)] font-mono">
                      &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;{' '}
                      {card.last4}
                    </span>
                    {card.isDefault && <Badge variant="info">{t('paymentMethods.default')}</Badge>}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {card.cardholderName} &middot;{' '}
                    {t('paymentMethods.expires', {
                      month: String(card.expMonth).padStart(2, '0'),
                      year: card.expYear,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button
                    data-testid={`card-set-default-${card.id}`}
                    onClick={() => handleSetDefault(card.id)}
                    className="text-xs text-accent hover:underline"
                  >
                    {t('paymentMethods.setDefault')}
                  </button>
                )}
                <button
                  data-testid={`card-delete-${card.id}`}
                  onClick={() => deleteCardConfirm.open(card.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {cards.length >= 5 && (
            <p className="text-xs text-[var(--text-secondary)] text-center">
              {t('paymentMethods.maxCards')}
            </p>
          )}
        </div>
      )}

      {/* Add Card Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              {t('paymentMethods.addCard')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('paymentMethods.cardNumber')}
                </label>
                <input
                  data-testid="card-number-input"
                  value={cardNumber}
                  onChange={e => {
                    setCardNumber(e.target.value);
                    setCardErrors(prev => ({ ...prev, cardNumber: '' }));
                  }}
                  placeholder={t('paymentMethods.cardNumberPlaceholder')}
                  className={`${inputCls} ${cardErrors.cardNumber ? 'border-red-500' : ''}`}
                />
                {cardErrors.cardNumber && (
                  <p data-testid="card-number-error" className="text-xs text-red-500 mt-1">
                    {cardErrors.cardNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('paymentMethods.cardholderName')}
                </label>
                <input
                  data-testid="cardholder-name-input"
                  value={cardholderName}
                  onChange={e => {
                    setCardholderName(e.target.value);
                    setCardErrors(prev => ({ ...prev, cardholderName: '' }));
                  }}
                  placeholder={t('paymentMethods.cardholderPlaceholder')}
                  maxLength={15}
                  className={`${inputCls} ${cardErrors.cardholderName ? 'border-red-500' : ''}`}
                />
                {cardErrors.cardholderName && (
                  <p data-testid="cardholder-name-error" className="text-xs text-red-500 mt-1">
                    {cardErrors.cardholderName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                    {t('paymentMethods.expMonth')}
                  </label>
                  <select
                    value={expMonth}
                    onChange={e => setExpMonth(+e.target.value)}
                    className={inputCls}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                    {t('paymentMethods.expYear')}
                  </label>
                  <select
                    value={expYear}
                    onChange={e => setExpYear(+e.target.value)}
                    className={inputCls}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {cardErrors.expiry && (
                <p data-testid="card-expiry-error" className="text-xs text-red-500 mt-1">
                  {cardErrors.expiry}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAddModalOpen(false);
                  setCardErrors({});
                }}
              >
                {t('common:actions.cancel', { ns: 'common' })}
              </Button>
              <Button size="sm" onClick={handleAdd} loading={saving}>
                {t('paymentMethods.addCard')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation */}
      <Modal
        open={deleteCardConfirm.isOpen}
        title={t('paymentMethods.deleteCard')}
        onConfirm={handleDelete}
        onCancel={() => deleteCardConfirm.close()}
        confirmLabel={t('paymentMethods.deleteCard')}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        danger
      >
        <p className="text-sm text-[var(--text-secondary)]">{t('paymentMethods.deleteConfirm')}</p>
      </Modal>
    </div>
  );
}
