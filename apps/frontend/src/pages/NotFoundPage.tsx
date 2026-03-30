import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      data-testid="not-found-page"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4"
    >
      <p data-testid="not-found-code" className="text-8xl font-black text-accent/20 select-none">
        404
      </p>
      <h1 data-testid="not-found-title" className="text-2xl font-bold text-[var(--text-primary)]">
        Page Not Found
      </h1>
      <p data-testid="not-found-message" className="text-[var(--text-secondary)] max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 mt-2">
        <Link to="/" data-testid="not-found-home-link">
          <Button>
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </Link>
        <Link to="/catalog" data-testid="not-found-catalog-link">
          <Button variant="secondary">
            <Search className="h-4 w-4" /> Browse Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
