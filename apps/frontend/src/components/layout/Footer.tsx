import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/auth';
import { Modal } from '@components/ui/Modal';
import { KeyboardShortcutsModal } from '@components/KeyboardShortcutsModal';
import { useToast } from '@components/ui/Toast';

export function Footer() {
  const { t } = useTranslation('common');
  const { accessToken, refreshToken, logout } = useAuthStore();
  const { toast } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(
    () => !!localStorage.getItem('planq_newsletter_email')
  );

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    }
    logout();
    setShowLogoutModal(false);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterError(t('footer.newsletter.invalidEmail'));
      return;
    }
    localStorage.setItem('planq_newsletter_email', newsletterEmail);
    setNewsletterSubscribed(true);
    toast('success', t('footer.newsletter.success'));
    setNewsletterEmail('');
  };

  return (
    <footer
      aria-label="Site footer"
      className="border-t border-[var(--border)] bg-[var(--bg-card)] mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Newsletter */}
        <div
          data-testid="footer-newsletter"
          className="mb-8 pb-8 border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3
              data-testid="footer-newsletter-title"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              {t('footer.newsletter.title')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
              {t('footer.newsletter.description')}
            </p>
          </div>
          {newsletterSubscribed ? (
            <p data-testid="footer-newsletter-success" className="text-sm text-accent font-medium">
              {t('footer.newsletter.alreadySubscribed')}
            </p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <div>
                <input
                  data-testid="footer-newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={e => {
                    setNewsletterEmail(e.target.value);
                    setNewsletterError('');
                  }}
                  placeholder={t('footer.newsletter.placeholder')}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {newsletterError && (
                  <p data-testid="footer-newsletter-error" className="text-xs text-red-500 mt-1">
                    {newsletterError}
                  </p>
                )}
              </div>
              <button
                data-testid="footer-newsletter-submit"
                type="submit"
                className="rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors shrink-0"
              >
                {t('footer.newsletter.subscribe')}
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
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
              <li>
                <Link
                  data-testid="footer-link-blog"
                  to="/blog"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.blog')}
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
                  data-testid="footer-link-faq"
                  to="/faq"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link
                  data-testid="footer-link-contact"
                  to="/contact"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link
                  data-testid="footer-link-shipping"
                  to="/shipping"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.shipping')}
                </Link>
              </li>
              <li>
                <Link
                  data-testid="footer-link-returns"
                  to="/returns"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.returns')}
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

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              {t('footer.legal')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  data-testid="footer-link-privacy"
                  to="/privacy"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  data-testid="footer-link-terms"
                  to="/terms"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social + copyright */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} PLANQ. {t('footer.rights')}
          </p>

          <div data-testid="footer-social" className="flex items-center gap-3">
            <a
              data-testid="footer-social-instagram"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.socialLabel.instagram')}
              className="h-5 w-5 text-[var(--text-secondary)] hover:text-accent transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              data-testid="footer-social-facebook"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.socialLabel.facebook')}
              className="h-5 w-5 text-[var(--text-secondary)] hover:text-accent transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              data-testid="footer-social-pinterest"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.socialLabel.pinterest')}
              className="h-5 w-5 text-[var(--text-secondary)] hover:text-accent transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M8 12a4 4 0 1 1 8 0c0 2.5-1.5 4-3 5l-1 3" />
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              </svg>
            </a>
            <a
              data-testid="footer-social-youtube"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.socialLabel.youtube')}
              className="h-5 w-5 text-[var(--text-secondary)] hover:text-accent transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.46z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
            <a
              data-testid="footer-social-twitter"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.socialLabel.twitter')}
              className="h-5 w-5 text-[var(--text-secondary)] hover:text-accent transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              data-testid="footer-keyboard-shortcuts"
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={t('footer.keyboardShortcuts')}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('footer.keyboardShortcuts')}</span>
            </button>
            <p className="text-xs text-[var(--text-secondary)]">{t('footer.builtFor')}</p>
          </div>
        </div>
      </div>

      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

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
