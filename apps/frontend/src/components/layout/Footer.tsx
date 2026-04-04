import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/auth';
import { Modal } from '@components/ui/Modal';

export function Footer() {
  const { t } = useTranslation('common');
  const { accessToken, refreshToken, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    }
    logout();
    setShowLogoutModal(false);
  };

  return (
    <footer
      aria-label="Site footer"
      className="border-t border-[var(--border)] bg-[var(--bg-card)] mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-accent"
              >
                <rect x="2" y="2" width="9" height="9" rx="1" />
                <rect x="13" y="2" width="9" height="9" rx="1" opacity="0.6" />
                <rect x="2" y="13" width="9" height="9" rx="1" opacity="0.6" />
                <rect x="13" y="13" width="9" height="9" rx="1" opacity="0.3" />
              </svg>
              <span className="font-bold text-[var(--text-primary)]">PLANQ</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              {t('footer.shop')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/catalog"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.allProducts')}
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?onSale=true"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.sale')}
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('nav.wishlist')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              {t('footer.account')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('nav.profile')}
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('nav.orders')}
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/wallet"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.wallet')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              {t('footer.help')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/support"
                  data-testid="footer-support-link"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('nav.support')}
                </Link>
              </li>
              <li>
                <Link
                  to="/500"
                  data-testid="footer-500-link"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.serverError')}
                </Link>
              </li>
              <li>
                {accessToken ? (
                  <button
                    data-testid="footer-signout-button"
                    onClick={() => setShowLogoutModal(true)}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    data-testid="footer-signin-link"
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} PLANQ. {t('footer.rights')}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{t('footer.builtFor')}</p>
        </div>
      </div>

      {/* Logout confirmation modal */}
      <Modal
        open={showLogoutModal}
        title={t('footer.logoutTitle')}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmLabel={t('nav.logout')}
        cancelLabel={t('actions.cancel')}
      >
        <p className="text-sm text-[var(--text-secondary)]">{t('footer.logoutMessage')}</p>
      </Modal>
    </footer>
  );
}
