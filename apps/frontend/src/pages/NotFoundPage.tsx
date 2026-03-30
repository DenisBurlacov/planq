import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-8xl font-black text-accent/20">404</p>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Page Not Found</h1>
      <p className="text-[var(--text-secondary)]">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
