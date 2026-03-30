import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Package, User, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth.store';
import { useThemeStore } from '@store/theme.store';
import { useCartStore } from '@store/cart.store';
import { authApi } from '@api/auth';

export function Navbar() {
  const { t, i18n } = useTranslation('common');
  const { user, accessToken, refreshToken, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const itemCount = useCartStore(s => s.itemCount);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => null);
    }
    logout();
    navigate('/login');
  };

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-card)] backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-accent">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <rect x="13" y="2" width="9" height="9" rx="1" opacity="0.6" />
              <rect x="2" y="13" width="9" height="9" rx="1" opacity="0.6" />
              <rect x="13" y="13" width="9" height="9" rx="1" opacity="0.3" />
            </svg>
            PLANQ
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/catalog"
              className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-sidebar)]"
            >
              {t('nav.catalog')}
            </Link>
            {accessToken && (
              <Link
                to="/orders"
                className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-sidebar)]"
              >
                {t('nav.orders')}
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLang}
              className="px-2 py-1 text-xs font-medium rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label="Toggle language"
            >
              {i18n.language === 'en' ? 'EN' : 'RU'}
            </button>

            <button
              onClick={toggle}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/wishlist"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label={t('nav.wishlist')}
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label={t('nav.cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {accessToken ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors text-sm"
                  aria-label={t('nav.profile')}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="hidden lg:block max-w-24 truncate">{user?.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-sidebar)] rounded-t-xl"
                  >
                    <User className="h-4 w-4" /> {t('nav.profile')}
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-sidebar)]"
                  >
                    <Package className="h-4 w-4" /> {t('nav.orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-sidebar)] rounded-b-xl"
                  >
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-sidebar)]"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-2 border-t border-[var(--border)]">
            <Link
              to="/catalog"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {t('nav.catalog')}
            </Link>
            {accessToken && (
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {t('nav.orders')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
