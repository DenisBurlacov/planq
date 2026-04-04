import { useEffect, useRef, type ReactNode } from 'react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  loadingElement?: ReactNode;
  endElement?: ReactNode;
  'data-testid'?: string;
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  loadingElement,
  endElement,
  'data-testid': testId,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [onLoadMore, hasMore, loading]);

  return (
    <div
      data-testid={testId ?? 'infinite-scroll-sentinel'}
      ref={sentinelRef}
      className="py-4 flex justify-center"
    >
      {loading &&
        (loadingElement ?? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        ))}
      {!hasMore && !loading && endElement}
    </div>
  );
}
