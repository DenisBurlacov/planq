import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="border-t border-[var(--border)] bg-[var(--bg-card)] mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-accent" />
                <div className="h-2.5 w-2.5 rounded-sm bg-accent/60" />
                <div className="h-2.5 w-2.5 rounded-sm bg-accent/60" />
                <div className="h-2.5 w-2.5 rounded-sm bg-accent/30" />
              </div>
              <span className="font-bold text-[var(--text-primary)]">PLANQ</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Scandinavian furniture for modern homes.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              Shop
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/catalog"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?onSale=true"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sale
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              Account
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/wallet"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              Help
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/catalog"
                  data-testid="footer-support-link"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/500"
                  data-testid="footer-500-link"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Server Error (test)
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  data-testid="footer-signin-link"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} PLANQ. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-secondary)]">Built for QA automation training</p>
        </div>
      </div>
    </footer>
  );
}
