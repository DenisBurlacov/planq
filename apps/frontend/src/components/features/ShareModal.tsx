import { useTranslation } from 'react-i18next';
import { ExternalLink, Send } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { CopyButton } from '@components/ui/CopyButton';
import { useState } from 'react';

interface ShareChannel {
  key: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: string;
}

interface ShareModalProps {
  channel: ShareChannel | null;
  productName: string;
  productUrl: string;
  onClose: () => void;
}

export function ShareModal({ channel, productName, productUrl, onClose }: ShareModalProps) {
  const { t } = useTranslation('catalog');
  const [message, setMessage] = useState('');

  if (!channel) return null;

  const defaultMessage = t(`product.shareModal.${channel.key}.defaultMessage`, {
    name: productName,
    defaultValue: productName,
  });

  return (
    <Modal
      open={!!channel}
      title={t(`product.shareModal.${channel.key}.title`)}
      onConfirm={() => {
        window.open(channel.shareUrl, '_blank', 'noopener,noreferrer');
        onClose();
      }}
      onCancel={onClose}
      confirmLabel={t('product.shareModal.send')}
      cancelLabel={t('common:actions.cancel')}
    >
      <div data-testid={`share-modal-${channel.key}`} className="space-y-4">
        {/* Channel header */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: channel.color }}
          >
            {channel.icon}
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              {t(`product.shareModal.${channel.key}.title`)}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t(`product.shareModal.${channel.key}.subtitle`)}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)]">
          {t(`product.shareModal.${channel.key}.description`)}
        </p>

        {/* Product being shared */}
        <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-sidebar)] p-3">
          <div className="shrink-0 h-12 w-12 rounded-md bg-accent/10 flex items-center justify-center">
            <Send className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{productName}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{productUrl}</p>
          </div>
          <CopyButton text={productUrl} />
        </div>

        {/* Message preview */}
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide block mb-1">
            {t('product.shareModal.messagePreview')}
          </label>
          <textarea
            data-testid={`share-modal-message-${channel.key}`}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            rows={3}
            value={message || defaultMessage}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {/* Share link preview */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{channel.shareUrl}</span>
        </div>
      </div>
    </Modal>
  );
}
