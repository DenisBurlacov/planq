import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ShoppingCart, Heart, ImageOff, Home, Tag } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Skeleton } from '@components/ui/Skeleton';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Accordion } from '@components/ui/Accordion';
import { productsApi } from '@api/products';
import { cartApi } from '@api/cart';
import { wishlistApi } from '@api/wishlist';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('catalog');
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id ?? ''),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => productsApi.getReviews(id ?? ''),
    enabled: !!id,
  });

  // Poll stock every 60s
  useQuery({
    queryKey: ['product-stock', id],
    queryFn: () => productsApi.getStock(id ?? ''),
    enabled: !!id,
    refetchInterval: 60_000,
  });

  const handleAddToCart = async () => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setAddingToCart(true);
    try {
      await cartApi.add(id ?? '');
      increment();
      toast('success', 'Added to cart');
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsWishlisted(prev => !prev);
    try {
      if (isWishlisted) {
        await wishlistApi.remove(id ?? '');
      } else {
        await wishlistApi.add(id ?? '');
      }
    } catch {
      setIsWishlisted(prev => !prev);
      toast('error', 'Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast('info', 'Please sign in');
      return;
    }
    setSubmittingReview(true);
    try {
      await productsApi.createReview(id ?? '', reviewRating, reviewComment);
      await qc.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewComment('');
      toast('success', 'Review submitted');
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="h-96" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = product.salePrice ?? product.price;
  const isOnSale = product.salePrice !== null;

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Catalog', to: '/catalog' },
    ...(product.category
      ? [{ label: product.category.name, to: `/catalog?categoryId=${product.category.id}` }]
      : []),
    { label: product.name },
  ];

  const specRows: Array<{ label: string; value: string }> = [
    { label: 'SKU', value: product.id.slice(0, 8).toUpperCase() },
    { label: 'Category', value: product.category?.name ?? '—' },
    {
      label: 'Availability',
      value: product.stock > 0 ? `In stock (${product.stock} units)` : 'Out of stock',
    },
    { label: 'Rating', value: `${product.rating.toFixed(1)} / 5 (${product.reviewCount} reviews)` },
  ];

  const accordionItems = [
    {
      title: 'Specifications',
      content: (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
          {specRows.map(row => (
            <div key={row.label} className="contents">
              <dt className="font-medium text-[var(--text-primary)]">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      title: 'Description',
      content: <p className="leading-relaxed">{product.description}</p>,
    },
    {
      title: 'Delivery & Returns',
      content: (
        <ul className="space-y-1 list-disc list-inside">
          <li>Free delivery on orders over €200</li>
          <li>Standard delivery 3–5 business days</li>
          <li>30-day return policy for unused items</li>
          <li>Contact support for large item assembly</li>
        </ul>
      ),
    },
    {
      title: 'Care Instructions',
      content: (
        <ul className="space-y-1 list-disc list-inside">
          <li>Wipe with a clean, damp cloth</li>
          <li>Avoid harsh chemicals and abrasive cleaners</li>
          <li>Keep away from direct sunlight to prevent fading</li>
          <li>Check manufacturer label for specific materials</li>
        </ul>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div data-testid="product-gallery">
          <div
            data-testid="product-image-main"
            className="relative rounded-xl overflow-hidden bg-[var(--bg-sidebar)] h-96 mb-3"
          >
            {product.images.length > 0 ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-opacity duration-200"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-16 w-16 text-[var(--text-secondary)]" />
              </div>
            )}
            {isOnSale && (
              <div className="absolute top-3 left-3">
                <Badge variant="sale">SALE</Badge>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div data-testid="product-thumbnails" className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  data-testid={`thumbnail-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage
                      ? 'border-accent'
                      : 'border-[var(--border)] hover:border-accent/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <div className="flex items-center gap-1 mb-2">
              <Tag className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-accent font-medium">{product.category.name}</span>
            </div>
          )}

          <h1
            data-testid="product-name"
            className="text-2xl font-bold text-[var(--text-primary)] mb-2"
          >
            {product.name}
          </h1>

          <div data-testid="product-rating" className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--border)]'}`}
                />
              ))}
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {product.rating.toFixed(1)} · {t('product.reviews', { count: product.reviewCount })}
            </span>
          </div>

          <div data-testid="product-price" className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-[var(--text-primary)]">
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-lg text-[var(--text-secondary)] line-through">
                €{product.price.toFixed(2)}
              </span>
            )}
            {isOnSale && (
              <span className="text-sm font-medium text-red-500">
                Save €{(product.price - price).toFixed(2)}
              </span>
            )}
          </div>

          <p data-testid="product-stock" className="text-sm mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600">
                {t('product.stockStatus', { count: product.stock })}
              </span>
            ) : (
              <span className="text-red-500">{t('common:outOfStock', { ns: 'common' })}</span>
            )}
          </p>

          <div className="flex gap-3 mb-6">
            <Button
              data-testid="add-to-cart-button"
              loading={addingToCart}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4" /> {t('product.addToCart')}
            </Button>
            <Button
              data-testid="wishlist-toggle-button"
              variant="secondary"
              onClick={handleToggleWishlist}
              aria-label={t('product.addToWishlist')}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 py-4 border-y border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Home className="h-4 w-4" />
              Free returns
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <ShoppingCart className="h-4 w-4" />
              Fast delivery
            </div>
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="mb-12" data-testid="product-accordion">
        <Accordion items={accordionItems} defaultOpen={0} />
      </div>

      {/* Reviews */}
      <section data-testid="reviews-section">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          {t('product.reviews', { count: reviews?.total ?? 0 })}
        </h2>

        {/* Write review */}
        {accessToken && (
          <form
            data-testid="review-form"
            onSubmit={handleSubmitReview}
            className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
          >
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Write a review</p>
            <div data-testid="review-stars" className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  data-testid={`star-${i + 1}`}
                  onClick={() => setReviewRating(i + 1)}
                >
                  <Star
                    className={`h-6 w-6 ${i < reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--border)]'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              data-testid="review-comment"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button
              data-testid="review-submit"
              type="submit"
              size="sm"
              loading={submittingReview}
              className="mt-2"
            >
              Submit Review
            </Button>
          </form>
        )}

        <div data-testid="reviews-list" className="space-y-4">
          {reviews?.items.map(review => (
            <div
              key={review.id}
              data-testid="review-item"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {review.user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {review.user.name}
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--border)]'}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>
              )}
            </div>
          ))}
          {reviews?.items.length === 0 && (
            <p
              data-testid="reviews-empty"
              className="text-center text-[var(--text-secondary)] py-8"
            >
              {t('product.noReviews')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
