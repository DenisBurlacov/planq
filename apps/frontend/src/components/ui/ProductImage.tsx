import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ProductImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  'data-testid'?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  'data-testid': testId,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div data-testid={testId} className="flex h-full w-full items-center justify-center">
        <ImageOff className="h-12 w-12 text-[var(--text-secondary)]" />
      </div>
    );
  }

  return (
    <img
      data-testid={testId}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImgError(true)}
      className={className}
    />
  );
}
