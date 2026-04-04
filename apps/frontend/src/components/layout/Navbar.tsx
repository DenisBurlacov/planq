import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Package,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@store/auth.store';
import { useThemeStore } from '@store/theme.store';
import { useCartStore } from '@store/cart.store';
import { authApi } from '@api/auth';
import { productsApi } from '@api/products';
import { MegaMenu } from './MegaMenu';

export function Navbar() {
  const { t, i18n } = useTranslation('common');
  const { user, accessToken, refreshToken, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const itemCount = useCartStore(s => s.itemCount);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Escape closes menus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Keyboard navigation for dropdown menu
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!dropdownOpen) return;
      const items = menuItemsRef.current.filter(Boolean) as HTMLElement[];
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
          break;
        }
        case 'Escape':
          setDropdownOpen(false);
          break;
      }
    },
    [dropdownOpen]
  );

  const handleCatalogMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setMegaMenuOpen(true);
  };

  const handleCatalogMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 300);
  };

  const isAdmin = user?.role === 'ADMIN';

  const pathname = location.pathname;
  const search = location.search;

  const navLinkClass = (path: string, matchSearch?: string) => {
    const isActive = matchSearch
      ? pathname === path.split('?')[0] && search.includes(matchSearch)
      : pathname === path && !search;
    return `px-3 py-2 text-sm transition-colors rounded-lg ${
      isActive
        ? 'text-accent font-medium bg-accent/5'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]'
    }`;
  };

  return (
    <nav
      data-testid="navbar"
      className={`sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-card)] backdrop-blur transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            data-testid="navbar-logo"
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-accent"
          >
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
            <div
              className="relative"
              onMouseEnter={handleCatalogMouseEnter}
              onMouseLeave={handleCatalogMouseLeave}
            >
              <Link data-testid="nav-catalog" to="/catalog" className={navLinkClass('/catalog')}>
                {t('nav.catalog')}
              </Link>
            </div>
            <Link data-testid="nav-about" to="/about" className={navLinkClass('/about')}>
              {t('nav.about')}
            </Link>
            <Link
              data-testid="nav-sale"
              to="/catalog?onSale=true"
              className={`${navLinkClass('/catalog', 'onSale=true')} ${
                pathname === '/catalog' && search.includes('onSale=true')
                  ? '!text-red-500 !font-medium'
                  : 'text-red-500 hover:text-red-600'
              }`}
            >
              {t('nav.sale')}
            </Link>
            <Link
              data-testid="nav-new-arrivals"
              to="/catalog?sort=newest"
              className={navLinkClass('/catalog', 'sort=newest')}
            >
              {t('nav.newArrivals')}
            </Link>
            {accessToken && (
              <Link data-testid="nav-orders" to="/orders" className={navLinkClass('/orders')}>
                {t('nav.orders')}
              </Link>
            )}
            {isAdmin && (
              <Link
                data-testid="nav-admin"
                to="/admin"
                className="flex items-center gap-1 px-3 py-2 text-sm text-accent hover:text-accent-hover transition-colors rounded-lg hover:bg-[var(--bg-sidebar)]"
              >
                <Shield className="h-4 w-4" />
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              data-testid="lang-toggle"
              onClick={toggleLang}
              className="px-2 py-1 text-xs font-medium rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label="Toggle language"
            >
              {i18n.language === 'en' ? 'EN' : 'RU'}
            </button>

            <button
              data-testid="theme-toggle"
              onClick={toggle}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              data-testid="nav-wishlist"
              to="/wishlist"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label={t('nav.wishlist')}
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              data-testid="nav-cart"
              to="/cart"
              className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-label={t('nav.cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  data-testid="cart-badge"
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {accessToken ? (
              <div className="relative" ref={dropdownRef} onKeyDown={handleDropdownKeyDown}>
                <button
                  data-testid="nav-profile-button"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors text-sm"
                  aria-label={t('nav.profile')}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
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
                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg"
                  >
                    <Link
                      ref={el => {
                        menuItemsRef.current[0] = el;
                      }}
                      role="menuitem"
                      data-testid="nav-profile-link"
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-sidebar)] rounded-t-xl"
                    >
                      <User className="h-4 w-4" /> {t('nav.profile')}
                    </Link>
                    <Link
                      ref={el => {
                        menuItemsRef.current[1] = el;
                      }}
                      role="menuitem"
                      data-testid="nav-orders-link"
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-sidebar)]"
                    >
                      <Package className="h-4 w-4" /> {t('nav.orders')}
                    </Link>
                    <button
                      ref={el => {
                        menuItemsRef.current[2] = el;
                      }}
                      role="menuitem"
                      data-testid="nav-logout-button"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-sidebar)] rounded-b-xl"
                    >
                      <LogOut className="h-4 w-4" /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                data-testid="nav-login-button"
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
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-2 border-t border-[var(--border)]">
            {/* Catalog with accordion */}
            <div>
              <button
                data-testid="mobile-menu-catalog-expand"
                onClick={() => setCatalogExpanded(!catalogExpanded)}
                aria-expanded={catalogExpanded}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                style={{ minHeight: '44px' }}
              >
                {t('nav.catalog')}
                {catalogExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {catalogExpanded && (
                <div className="pl-6 pb-2">
                  <Link
                    to="/catalog"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {t('catalog:filters.allCategories', { ns: 'catalog' })}
                  </Link>
                  {categories?.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/catalog?categoryId=${cat.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/about"
              data-testid="mobile-menu-about"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              style={{ minHeight: '44px' }}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/catalog?onSale=true"
              data-testid="mobile-menu-sale"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-red-500 hover:text-red-600"
              style={{ minHeight: '44px' }}
            >
              {t('nav.sale')}
            </Link>
            <Link
              to="/catalog?sort=newest"
              data-testid="mobile-menu-new-arrivals"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              style={{ minHeight: '44px' }}
            >
              {t('nav.newArrivals')}
            </Link>
            {accessToken && (
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                style={{ minHeight: '44px' }}
              >
                {t('nav.orders')}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                data-testid="nav-admin-mobile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-accent"
                style={{ minHeight: '44px' }}
              >
                <Shield className="h-4 w-4" />
                {t('nav.admin')}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mega Menu */}
      <div onMouseEnter={handleCatalogMouseEnter} onMouseLeave={handleCatalogMouseLeave}>
        <MegaMenu
          categories={categories ?? []}
          open={megaMenuOpen}
          onClose={() => setMegaMenuOpen(false)}
        />
      </div>
    </nav>
  );
}
