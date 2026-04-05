import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from '@components/ui/ScrollToTop';
import { SessionExpiredModal } from '@components/SessionExpiredModal';
import { CookieConsent } from '@components/CookieConsent';
import { EmailVerificationBanner } from '@components/EmailVerificationBanner';
import { KeyboardShortcutsModal } from '@components/KeyboardShortcutsModal';

export function Layout() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if inside an input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // Ctrl+K / Cmd+K -> focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[aria-label*="Search"], [placeholder*="Search"], [placeholder*="Поиск"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // ? -> open shortcuts modal (only if not in input)
      if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
        return;
      }

      // Escape closes shortcuts
      if (e.key === 'Escape' && shortcutsOpen) {
        setShortcutsOpen(false);
      }
    },
    [shortcutsOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <EmailVerificationBanner />
      <Navbar />
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <SessionExpiredModal />
      <CookieConsent />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
