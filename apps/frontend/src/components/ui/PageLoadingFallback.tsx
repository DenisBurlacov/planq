export function PageLoadingFallback() {
  return (
    <div
      data-testid="page-loading-fallback"
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}
