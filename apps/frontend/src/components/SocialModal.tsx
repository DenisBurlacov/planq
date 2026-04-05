import { useTranslation } from 'react-i18next';
import { ExternalLink, Users, ImageIcon, Hash, Heart } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { CopyButton } from '@components/ui/CopyButton';

interface SocialPlatform {
  key: string;
  icon: React.ReactNode;
  color: string;
  followers: string;
  url: string;
}

interface SocialModalProps {
  platform: SocialPlatform | null;
  onClose: () => void;
}

export function SocialModal({ platform, onClose }: SocialModalProps) {
  const { t } = useTranslation('common');

  if (!platform) return null;

  return (
    <Modal
      open={!!platform}
      title={t(`footer.social.${platform.key}.title`)}
      onConfirm={onClose}
      onCancel={onClose}
      confirmLabel={t('actions.cancel')}
      cancelLabel=""
    >
      <div data-testid={`social-modal-${platform.key}`} className="space-y-4">
        {/* Header with icon and followers */}
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: platform.color }}
            data-testid={`social-modal-icon-${platform.key}`}
          >
            {platform.icon}
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">
              {t(`footer.social.${platform.key}.handle`)}
            </p>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <Users className="h-3 w-3" />
              <span data-testid={`social-modal-followers-${platform.key}`}>
                {platform.followers} {t('footer.social.followers')}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)]">
          {t(`footer.social.${platform.key}.description`)}
        </p>

        {/* What we post */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            {t('footer.social.whatWePost')}
          </p>
          <ul className="space-y-1.5">
            {[1, 2, 3].map(i => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                {i === 1 && <ImageIcon className="h-4 w-4 text-accent shrink-0 mt-0.5" />}
                {i === 2 && <Hash className="h-4 w-4 text-accent shrink-0 mt-0.5" />}
                {i === 3 && <Heart className="h-4 w-4 text-accent shrink-0 mt-0.5" />}
                <span>{t(`footer.social.${platform.key}.post${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mock link + copy */}
        <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-sidebar)] p-3">
          <ExternalLink className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
          <span
            data-testid={`social-modal-url-${platform.key}`}
            className="text-sm text-accent truncate flex-1"
          >
            {platform.url}
          </span>
          <CopyButton text={platform.url} />
        </div>

        {/* Follow button */}
        <button
          data-testid={`social-modal-follow-${platform.key}`}
          className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: platform.color }}
          onClick={onClose}
        >
          {t('footer.social.follow')} {t(`footer.social.${platform.key}.title`)}
        </button>
      </div>
    </Modal>
  );
}
