interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-[var(--bg-sidebar)] ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full mt-3" />
      </div>
    </div>
  );
}
