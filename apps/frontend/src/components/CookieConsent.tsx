import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Cookie } from 'lucide-react';
import { Button } from '@components/ui/Button';

const STORAGE_KEY = 'planq-cookies';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  accepted: boolean;
}

function getStoredPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CookiePreferences;
  } catch {
    // ignore
  }
  return null;
}

function savePreferences(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function CookieConsent() {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredPreferences();
    if (!stored || !stored.accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    savePreferences({ essential: true, analytics: true, marketing: true, accepted: true });
    setVisible(false);
  };

  const handleDecline = () => {
    savePreferences({ essential: true, analytics: false, marketing: false, accepted: true });
    setVisible(false);
  };

  const handleSaveCustom = () => {
    savePreferences({ essential: true, analytics, marketing, accepted: true });
    setVisible(false);
    setShowSettings(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div
          data-testid="cookie-settings-overlay"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50"
          onClick={() => setShowSettings(false)}
        >
          <div
            data-testid="cookie-settings-modal"
            className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                data-testid="cookie-settings-title"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                {t('cookieConsent.settingsTitle')}
              </h2>
              <button
                data-testid="cookie-settings-close"
                onClick={() => setShowSettings(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Essential */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('cookieConsent.essential')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('cookieConsent.essentialDesc')}
                  </p>
                </div>
                <input
                  data-testid="cookie-toggle-essential"
                  type="checkbox"
                  checked
                  disabled
                  className="mt-1 accent-accent"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('cookieConsent.analytics')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('cookieConsent.analyticsDesc')}
                  </p>
                </div>
                <input
                  data-testid="cookie-toggle-analytics"
                  type="checkbox"
                  checked={analytics}
                  onChange={e => setAnalytics(e.target.checked)}
                  className="mt-1 accent-accent"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('cookieConsent.marketing')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('cookieConsent.marketingDesc')}
                  </p>
                </div>
                <input
                  data-testid="cookie-toggle-marketing"
                  type="checkbox"
                  checked={marketing}
                  onChange={e => setMarketing(e.target.checked)}
                  className="mt-1 accent-accent"
                />
              </div>
            </div>

            <Button
              data-testid="cookie-save-preferences"
              className="w-full mt-6"
              onClick={handleSaveCustom}
            >
              {t('cookieConsent.savePreferences')}
            </Button>
          </div>
        </div>
      )}

      {/* Banner */}
      <div
        data-testid="cookie-consent-banner"
        className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[var(--border)] bg-[var(--bg-card)] shadow-lg"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p
                data-testid="cookie-consent-message"
                className="text-sm text-[var(--text-secondary)]"
              >
                {t('cookieConsent.message')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                data-testid="cookie-customize"
                onClick={() => setShowSettings(true)}
                className="text-sm text-accent hover:underline"
              >
                {t('cookieConsent.customize')}
              </button>
              <Button
                data-testid="cookie-decline"
                variant="ghost"
                size="sm"
                onClick={handleDecline}
              >
                {t('cookieConsent.decline')}
              </Button>
              <Button data-testid="cookie-accept" size="sm" onClick={handleAccept}>
                {t('cookieConsent.accept')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
