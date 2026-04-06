import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { Modal } from '@components/ui/Modal';
import { webhooksApi, type WebhookSubscription } from '@api/webhooks';
import { ApiException } from '@api/client';
import { useConfirmModal } from '@hooks/useConfirmModal';

export interface WebhooksTabProps {
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export function WebhooksTab({ toast }: WebhooksTabProps) {
  const { t } = useTranslation('profile');

  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<Set<string>>(new Set());
  const [savingWebhook, setSavingWebhook] = useState(false);
  const deleteWebhookConfirm = useConfirmModal<WebhookSubscription>();
  const [expandedDeliveries, setExpandedDeliveries] = useState<Set<string>>(new Set());

  const { data: webhooks, refetch: refetchWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      try {
        return await webhooksApi.list();
      } catch {
        return [] as WebhookSubscription[];
      }
    },
  });

  const handleAddWebhook = async () => {
    if (!webhookUrl || webhookEvents.size === 0) return;
    setSavingWebhook(true);
    try {
      await webhooksApi.create(webhookUrl, Array.from(webhookEvents));
      await refetchWebhooks();
      setWebhookModalOpen(false);
      setWebhookUrl('');
      setWebhookEvents(new Set());
      toast('success', t('webhooks.created'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleToggleWebhook = async (id: string, active: boolean) => {
    try {
      await webhooksApi.toggle(id, active);
      await refetchWebhooks();
      toast('success', t('webhooks.toggled'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    }
  };

  const handleDeleteWebhook = async () => {
    if (!deleteWebhookConfirm.target) return;
    try {
      await webhooksApi.remove(deleteWebhookConfirm.target.id);
      await refetchWebhooks();
      toast('success', t('webhooks.deleted'));
    } catch (err) {
      toast(
        'error',
        err instanceof ApiException ? err.message : t('common:errors.generic', { ns: 'common' })
      );
    } finally {
      deleteWebhookConfirm.close();
    }
  };

  const toggleDeliveries = useCallback((id: string) => {
    setExpandedDeliveries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div data-testid="tab-panel-webhooks">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--text-primary)]">{t('webhooks.title')}</h2>
        <Button
          data-testid="add-webhook-button"
          size="sm"
          onClick={() => {
            setWebhookUrl('');
            setWebhookEvents(new Set());
            setWebhookModalOpen(true);
          }}
        >
          + {t('webhooks.addWebhook')}
        </Button>
      </div>

      {!webhooks?.length ? (
        <div
          data-testid="webhooks-empty"
          className="flex flex-col items-center justify-center py-16 gap-3"
        >
          <p className="text-[var(--text-primary)] font-medium">{t('webhooks.empty')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('webhooks.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((wh, index) => (
            <div
              key={wh.id}
              data-testid={`webhook-card-${index}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    data-testid={`webhook-url-${index}`}
                    className="text-sm font-mono text-[var(--text-primary)] truncate"
                  >
                    {wh.url}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {wh.events.map(event => (
                      <span
                        key={event}
                        className="text-xs rounded bg-[var(--bg-sidebar)] px-2 py-0.5 text-[var(--text-secondary)]"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle
                    data-testid={`webhook-toggle-${index}`}
                    checked={wh.active}
                    onChange={v => handleToggleWebhook(wh.id, v)}
                    label=""
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                <button
                  data-testid={`webhook-deliveries-${index}`}
                  onClick={() => toggleDeliveries(wh.id)}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  {expandedDeliveries.has(wh.id) ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      {t('webhooks.hideDeliveries')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      {t('webhooks.viewDeliveries')}
                    </>
                  )}
                </button>
                <button
                  data-testid={`webhook-delete-${index}`}
                  onClick={() => deleteWebhookConfirm.open(wh)}
                  className="text-xs text-red-500 hover:underline ml-auto flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {t('webhooks.delete')}
                </button>
              </div>

              {/* Deliveries */}
              {expandedDeliveries.has(wh.id) && (
                <div data-testid={`webhook-deliveries-list-${index}`} className="mt-3 space-y-2">
                  {wh.deliveries.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] py-2">
                      {t('webhooks.noDeliveries')}
                    </p>
                  ) : (
                    wh.deliveries.map((delivery, di) => (
                      <div
                        key={delivery.id}
                        data-testid={`delivery-${index}-${di}`}
                        className="rounded-lg bg-[var(--bg-sidebar)] p-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[var(--text-primary)]">
                            {delivery.event}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              delivery.status === 'sent'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {delivery.status}
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)] mt-1">
                          {new Date(delivery.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Webhook Modal */}
      <Modal
        open={webhookModalOpen}
        title={t('webhooks.addWebhook')}
        onConfirm={handleAddWebhook}
        onCancel={() => setWebhookModalOpen(false)}
        confirmLabel={t('common:actions.save', { ns: 'common' })}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        loading={savingWebhook}
      >
        <div data-testid="webhook-modal" className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              {t('webhooks.url')}
            </label>
            <input
              data-testid="webhook-url-input"
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder={t('webhooks.urlPlaceholder')}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
              {t('webhooks.events')}
            </label>
            <div className="space-y-2">
              {['order.created', 'order.status.updated'].map(event => (
                <label
                  key={event}
                  data-testid={`webhook-event-${event}`}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={webhookEvents.has(event)}
                    onChange={e => {
                      setWebhookEvents(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(event);
                        else next.delete(event);
                        return next;
                      });
                    }}
                    className="rounded"
                  />
                  <span className="font-mono text-[var(--text-primary)]">{event}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Webhook Confirmation */}
      <Modal
        open={deleteWebhookConfirm.isOpen}
        title={t('webhooks.delete')}
        onConfirm={handleDeleteWebhook}
        onCancel={() => deleteWebhookConfirm.close()}
        confirmLabel={t('webhooks.delete')}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        danger
      >
        <p>{t('webhooks.deleteConfirm')}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">
          {deleteWebhookConfirm.target?.url}
        </p>
      </Modal>
    </div>
  );
}
