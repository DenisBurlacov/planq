import { useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  alt?: string;
}

export function ImageCarousel({ images, activeIndex, onChange, alt = '' }: ImageCarouselProps) {
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) onChange(images.length - 1);
      else if (index >= images.length) onChange(0);
      else onChange(index);
    },
    [images.length, onChange]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) goPrev();
      else goNext();
    }
  };

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      data-testid="image-carousel"
      className="relative"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Product images"
    >
      {/* Main image */}
      <div
        data-testid="carousel-viewport"
        className="relative rounded-xl overflow-hidden bg-[var(--bg-sidebar)] h-96"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          data-testid="carousel-image"
          src={images[activeIndex]}
          alt={`${alt} ${activeIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-200"
        />

        {/* Prev/Next arrows */}
        {images.length > 1 && (
          <>
            <button
              data-testid="carousel-prev"
              onClick={goPrev}
              aria-label={t('carousel.previous')}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-card)]/80 border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              data-testid="carousel-next"
              onClick={goNext}
              aria-label={t('carousel.next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-card)]/80 border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div data-testid="carousel-dots" className="flex items-center justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              data-testid={`carousel-dot-${i}`}
              onClick={() => onChange(i)}
              aria-label={t('carousel.goToSlide', { index: i + 1 })}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex
                  ? 'w-6 bg-accent'
                  : 'w-2 bg-[var(--border)] hover:bg-[var(--text-secondary)]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
