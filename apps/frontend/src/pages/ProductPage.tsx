import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ShoppingCart, Heart, ArrowLeft, ImageOff } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Skeleton } from '@components/ui/Skeleton';
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

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative rounded-xl overflow-hidden bg-[var(--bg-sidebar)] h-80 mb-3">
            {product.images.length > 0 ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
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
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-accent' : 'border-[var(--border)]'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--border)]'}`}
                />
              ))}
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {t('product.reviews', { count: product.reviewCount })}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-[var(--text-primary)]">
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-lg text-[var(--text-secondary)] line-through">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {product.stock > 0 ? (
              <span className="text-green-600">
                {t('product.stockStatus', { count: product.stock })}
              </span>
            ) : (
              <span className="text-red-500">{t('common:outOfStock', { ns: 'common' })}</span>
            )}
          </p>

          <p className="text-sm text-[var(--text-primary)] mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="flex gap-3">
            <Button
              loading={addingToCart}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4" /> {t('product.addToCart')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleToggleWishlist}
              aria-label={t('product.addToWishlist')}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          {t('product.reviews', { count: reviews?.total ?? 0 })}
        </h2>

        {/* Write review */}
        {accessToken && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
          >
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Write a review</p>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setReviewRating(i + 1)}>
                  <Star
                    className={`h-6 w-6 ${i < reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--border)]'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" size="sm" loading={submittingReview} className="mt-2">
              Submit Review
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {reviews?.items.map(review => (
            <div
              key={review.id}
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
            <p className="text-center text-[var(--text-secondary)] py-8">
              {t('product.noReviews')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
