import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';

export function ServerErrorPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-8xl font-black text-red-500/20">500</p>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Server Error</h1>
      <p className="text-[var(--text-secondary)]">Something went wrong on our end.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
