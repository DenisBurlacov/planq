import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, Home, Tag } from 'lucide-react';
import { StarRating } from '@components/ui/StarRating';
import { useFeatureFlag } from '@hooks/useFeatureFlag';
import { ImageCarousel } from '@components/ImageCarousel';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { PriceDisplay } from '@components/ui/PriceDisplay';
import { ProductImage } from '@components/ui/ProductImage';
import { Skeleton } from '@components/ui/Skeleton';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Accordion } from '@components/ui/Accordion';
import { AddToCartModal } from '@components/ui/AddToCartModal';
import { BackButton } from '@components/ui/BackButton';
import { SpecsTable } from '@components/ui/SpecsTable';
import { Modal } from '@components/ui/Modal';
import { CountdownTimer } from '@components/ui/CountdownTimer';
import { StockUrgencyBadge } from '@components/ui/StockUrgencyBadge';
import { ShareProduct } from '@components/features/ShareProduct';
import { NotifyWhenInStock } from '@components/features/NotifyWhenInStock';
import { FileUploadZone } from '@components/ui/FileUploadZone';
import { productsApi } from '@api/products';
import { cartApi } from '@api/cart';
import { wishlistApi } from '@api/wishlist';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import { ApiException } from '@api/client';
import { RelatedProductsSection } from '@components/features/RelatedProductsSection';
import {
  RecentlyViewedSection,
  addToRecentlyViewed,
} from '@components/features/RecentlyViewedSection';
import type { ProductVariant } from '@appTypes/api';

// --- Color map for swatches ---
const COLOR_HEX: Record<string, string> = {
  Natural: '#d4a574',
  Walnut: '#5c4033',
  White: '#f5f5f5',
  Black: '#222222',
  Gray: '#9ca3af',
  Blue: '#3b82f6',
};

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('catalog');
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const enableReviews = useFeatureFlag('enable_reviews');

  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Variant state
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Photo review state
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewImageFiles, setReviewImageFiles] = useState<File[]>([]);

  // Review photo modal
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalSrc, setPhotoModalSrc] = useState('');

  // Rating filter
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id ?? ''),
    enabled: !!id,
  });

  const [reviewsPage, setReviewsPage] = useState(1);
  const [allReviews, setAllReviews] = useState<import('@appTypes/api').Review[]>([]);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id, ratingFilter],
    queryFn: () => productsApi.getReviews(id ?? '', 1, ratingFilter),
    enabled: !!id,
  });

  // Track recently viewed
  useEffect(() => {
    if (id) addToRecentlyViewed(id);
  }, [id]);

  // Sync initial reviews
  useEffect(() => {
    if (reviews?.items) {
      setAllReviews(reviews.items);
      setReviewsPage(1);
    }
  }, [reviews?.items]);

  // Auto-select first available variant
  useEffect(() => {
    if (!product?.variants?.length) return;
    const colors = [...new Set(product.variants.filter(v => v.color).map(v => v.color as string))];
    const sizes = [...new Set(product.variants.filter(v => v.size).map(v => v.size as string))];
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
  }, [product?.variants, selectedColor, selectedSize]);

  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants?.length) return undefined;
    return product.variants.find(
      v => (!v.color || v.color === selectedColor) && (!v.size || v.size === selectedSize)
    );
  }, [product?.variants, selectedColor, selectedSize]);

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.filter(v => v.color).map(v => v.color as string))];
  }, [product?.variants]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.filter(v => v.size).map(v => v.size as string))];
  }, [product?.variants]);

  const effectiveStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);

  const handleLoadMoreReviews = async () => {
    if (!id || loadingMoreReviews) return;
    setLoadingMoreReviews(true);
    try {
      const nextPage = reviewsPage + 1;
      const result = await productsApi.getReviews(id, nextPage, ratingFilter);
      setAllReviews(prev => [...prev, ...result.items]);
      setReviewsPage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  // Poll stock every 60s
  useQuery({
    queryKey: ['product-stock', id],
    queryFn: () => productsApi.getStock(id ?? ''),
    enabled: !!id,
    refetchInterval: 60_000,
  });

  const handleAddToCart = () => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setCartModalOpen(true);
  };

  const handleCartModalConfirm = async (quantity: number) => {
    setAddingToCart(true);
    try {
      await cartApi.add(id ?? '', quantity);
      increment(quantity);
      toast('success', t('product.addedToCart'));
      setCartModalOpen(false);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('product.failedAddToCart'));
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
      toast('error', t('product.failedUpdateWishlist'));
    }
  };

  const handleReviewImageUpload = (files: File[]) => {
    const remaining = 3 - reviewImages.length;
    const toAdd = files.slice(0, remaining);
    const urls = toAdd.map(f => URL.createObjectURL(f));
    setReviewImages(prev => [...prev, ...urls]);
    setReviewImageFiles(prev => [...prev, ...toAdd]);
  };

  const handleRemoveReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setReviewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast('info', t('common:errors.unauthorized', { ns: 'common' }));
      return;
    }
    setSubmittingReview(true);
    try {
      // In a real app we'd upload images first, but for now pass URLs
      const imageUrls = reviewImageFiles.length > 0 ? reviewImages : undefined;
      await productsApi.createReview(id ?? '', reviewRating, reviewComment, imageUrls);
      await qc.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewComment('');
      setReviewImages([]);
      setReviewImageFiles([]);
      toast('success', t('product.reviewSubmitted'));
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : t('product.failedSubmitReview'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRatingBarClick = (rating: number) => {
    setRatingFilter(prev => (prev === rating ? undefined : rating));
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

  const localizedName = i18n.language === 'ru' && product.nameRu ? product.nameRu : product.name;
  const localizedDescription =
    i18n.language === 'ru' && product.descriptionRu ? product.descriptionRu : product.description;

  const basePrice = product.salePrice ?? product.price;
  const priceAdjustment = selectedVariant?.priceAdjustment ?? 0;
  const price = basePrice + priceAdjustment;
  const isOnSale = product.salePrice !== null;

  // Use variant image if available
  const displayImages = selectedVariant?.image
    ? [selectedVariant.image, ...product.images.filter(img => img !== selectedVariant.image)]
    : product.images;

  const breadcrumbItems = [
    { label: t('common:nav.home', { ns: 'common' }), to: '/' },
    { label: t('common:nav.catalog', { ns: 'common' }), to: '/catalog' },
    ...(product.category
      ? [{ label: product.category.name, to: `/catalog?categoryId=${product.category.id}` }]
      : []),
    { label: localizedName },
  ];

  const specsTableRows = [
    {
      label: t('product.material', { defaultValue: 'Material' }),
      value: product.specs?.material ?? product.category?.name ?? '—',
    },
    { label: t('product.dimensions', { defaultValue: 'Dimensions' }), value: '120 x 60 x 75 cm' },
    { label: t('product.weight', { defaultValue: 'Weight' }), value: '18.5 kg' },
    {
      label: t('product.color', { defaultValue: 'Color' }),
      value: product.specs?.color ?? 'Natural',
    },
    { label: t('product.warranty', { defaultValue: 'Warranty' }), value: '2 years' },
    { label: t('product.sku'), value: product.id.slice(0, 8).toUpperCase() },
    { label: t('product.category'), value: product.category?.name ?? '—' },
    {
      label: t('product.availability'),
      value:
        effectiveStock > 0
          ? t('product.inStockUnits', { count: effectiveStock })
          : t('product.outOfStock'),
    },
    {
      label: t('product.ratingLabel'),
      value: `${product.rating.toFixed(1)} / 5 (${t('product.reviews', { count: product.reviewCount })})`,
    },
  ];

  const accordionItems = [
    {
      title: t('product.description'),
      content: <p className="leading-relaxed">{localizedDescription}</p>,
    },
    {
      title: t('product.deliveryReturns'),
      content: (
        <ul className="space-y-1 list-disc list-inside">
          <li>{t('product.deliveryFree')}</li>
          <li>{t('product.deliveryStandard')}</li>
          <li>{t('product.returnPolicy')}</li>
          <li>{t('product.assemblySupport')}</li>
        </ul>
      ),
    },
    {
      title: t('product.careInstructions'),
      content: (
        <ul className="space-y-1 list-disc list-inside">
          <li>{t('product.careWipe')}</li>
          <li>{t('product.careChemicals')}</li>
          <li>{t('product.careSunlight')}</li>
          <li>{t('product.careLabel')}</li>
        </ul>
      ),
    },
  ];

  // Rating breakdown
  const ratingBreakdown = product.ratingBreakdown ?? {};
  const totalReviews = product.reviewCount || 1;

  const productUrl = `${window.location.origin}/catalog/${product.id}`;

  return (
    <div>
      {product && (
        <AddToCartModal
          product={product}
          open={cartModalOpen}
          loading={addingToCart}
          onConfirm={handleCartModalConfirm}
          onCancel={() => setCartModalOpen(false)}
        />
      )}

      {/* Size Guide Modal */}
      <Modal
        open={sizeGuideOpen}
        title={t('product.sizeGuide', { defaultValue: 'Size Guide' })}
        onConfirm={() => setSizeGuideOpen(false)}
        onCancel={() => setSizeGuideOpen(false)}
        confirmLabel={t('common:actions.cancel', { defaultValue: 'Close' })}
        cancelLabel=""
      >
        <div data-testid="size-guide-modal">
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {t('product.productType', { defaultValue: 'Product Type' })}:{' '}
            {product.category
              ? t(`categories.${product.category.slug}`, { defaultValue: product.category.name })
              : t('common:nav.catalog')}
          </p>
          <table
            data-testid="size-guide-table"
            className="w-full text-sm border border-[var(--border)] rounded-lg overflow-hidden"
          >
            <thead>
              <tr className="bg-[var(--table-header-bg)]">
                <th className="px-3 py-2 text-left">
                  {t('product.size', { defaultValue: 'Size' })}
                </th>
                <th className="px-3 py-2 text-left">{t('product.width', { defaultValue: 'W' })}</th>
                <th className="px-3 py-2 text-left">{t('product.depth', { defaultValue: 'D' })}</th>
                <th className="px-3 py-2 text-left">
                  {t('product.height', { defaultValue: 'H' })}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2">Small</td>
                <td className="px-3 py-2">80</td>
                <td className="px-3 py-2">50</td>
                <td className="px-3 py-2">75</td>
              </tr>
              <tr className="bg-[var(--table-stripe)]">
                <td className="px-3 py-2">Medium</td>
                <td className="px-3 py-2">120</td>
                <td className="px-3 py-2">60</td>
                <td className="px-3 py-2">75</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Large</td>
                <td className="px-3 py-2">160</td>
                <td className="px-3 py-2">80</td>
                <td className="px-3 py-2">75</td>
              </tr>
              <tr className="bg-[var(--table-stripe)]">
                <td className="px-3 py-2">XL</td>
                <td className="px-3 py-2">200</td>
                <td className="px-3 py-2">90</td>
                <td className="px-3 py-2">75</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-[var(--text-secondary)] mt-3">
            {t('product.dimensionsNote', { defaultValue: 'All dimensions in centimeters.' })}
          </p>
        </div>
      </Modal>

      {/* Photo modal */}
      <Modal
        open={photoModalOpen}
        title={t('photoReview.viewPhoto')}
        onConfirm={() => setPhotoModalOpen(false)}
        onCancel={() => setPhotoModalOpen(false)}
        confirmLabel={t('common:actions.cancel', { defaultValue: 'Close' })}
        cancelLabel=""
      >
        <img src={photoModalSrc} alt="" className="w-full rounded-lg object-contain max-h-[60vh]" />
      </Modal>

      <BackButton fallbackTo="/catalog" className="mb-3" />
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div data-testid="product-gallery">
          {displayImages.length > 0 ? (
            <div className="relative">
              <ImageCarousel
                images={displayImages}
                activeIndex={activeImage}
                onChange={setActiveImage}
                alt={localizedName}
              />
              {isOnSale && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge variant="sale">{t('common:sale', { ns: 'common' })}</Badge>
                </div>
              )}
            </div>
          ) : (
            <div
              data-testid="product-image-main"
              className="relative rounded-xl overflow-hidden bg-[var(--bg-sidebar)] h-96 mb-3"
            >
              <ProductImage src={undefined} alt={localizedName} />
            </div>
          )}

          {displayImages.length > 1 && (
            <div data-testid="product-thumbnails" className="flex gap-2 overflow-x-auto pb-1 mt-3">
              {displayImages.map((img, i) => (
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
                    alt={`${localizedName} ${i + 1}`}
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
            {localizedName}
          </h1>

          <div data-testid="product-rating" className="flex items-center gap-2 mb-4">
            <StarRating value={product.rating} size="md" />
            <span className="text-sm text-[var(--text-secondary)]">
              {product.rating.toFixed(1)} · {t('product.reviews', { count: product.reviewCount })}
            </span>
          </div>

          <div data-testid="product-price" className="mb-4">
            <PriceDisplay
              price={product.price + priceAdjustment}
              salePrice={isOnSale ? price : null}
              size="lg"
              showSave
              data-testid="product-price-display"
            />
          </div>

          {/* Sale countdown */}
          {isOnSale && product.saleEndsAt && (
            <div className="mb-4">
              <p className="text-xs text-[var(--text-secondary)] mb-1.5">
                {t('countdown.saleEnds')}
              </p>
              <CountdownTimer endDate={product.saleEndsAt} />
            </div>
          )}

          {/* Color swatches */}
          {availableColors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                {t('product.selectColor')}
              </p>
              <div className="flex gap-2">
                {availableColors.map(color => (
                  <button
                    key={color}
                    data-testid={`variant-color-${color.toLowerCase()}`}
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-accent ring-2 ring-accent/30'
                        : 'border-[var(--border)] hover:border-accent/50'
                    }`}
                    style={{ backgroundColor: COLOR_HEX[color] ?? '#ccc' }}
                    aria-label={color}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size pills */}
          {availableSizes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                {t('product.selectSize')}
              </p>
              <div className="flex gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    data-testid={`variant-size-${size.toLowerCase()}`}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-accent text-white'
                        : 'bg-[var(--bg-sidebar)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-accent/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock display with urgency */}
          <div data-testid="product-stock" className="flex items-center gap-2 text-sm mb-4">
            {effectiveStock > 0 ? (
              <>
                <span data-testid="variant-stock" className="text-green-600">
                  {t('product.stockStatus', { count: effectiveStock })}
                </span>
                <StockUrgencyBadge stock={effectiveStock} />
              </>
            ) : (
              <span className="text-red-500">{t('common:outOfStock', { ns: 'common' })}</span>
            )}
          </div>

          {/* Add to cart / Notify */}
          {effectiveStock > 0 ? (
            <div className="flex gap-3 mb-4">
              <Button
                data-testid="add-to-cart-button"
                loading={addingToCart}
                disabled={effectiveStock === 0}
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
          ) : (
            <div className="mb-4">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                {t('common:outOfStock', { ns: 'common' })}
              </p>
              <NotifyWhenInStock productId={product.id} />
            </div>
          )}

          {/* Share buttons */}
          <div className="mb-4">
            <ShareProduct productName={localizedName} productUrl={productUrl} />
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 py-4 border-y border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Home className="h-4 w-4" />
              {t('product.freeReturns')}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <ShoppingCart className="h-4 w-4" />
              {t('product.fastDelivery')}
            </div>
          </div>
        </div>
      </div>

      {/* Specs Table */}
      <div className="mb-12">
        <SpecsTable rows={specsTableRows} onSizeGuide={() => setSizeGuideOpen(true)} />
      </div>

      {/* Accordion */}
      <div className="mb-12" data-testid="product-accordion">
        <Accordion items={accordionItems} defaultOpen={0} />
      </div>

      {/* Video Review */}
      <div data-testid="product-video" className="mb-12">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          {t('product.videoReview')}
        </h2>
        <div
          data-testid="product-video-placeholder"
          className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-sidebar)] flex flex-col items-center justify-center aspect-video"
        >
          <svg
            className="h-16 w-16 text-[var(--text-secondary)] mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {t('product.videoComingSoon')}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('product.videoComingSoonDesc')}
          </p>
        </div>
      </div>

      {/* Reviews */}
      <section data-testid="reviews-section">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          {t('product.reviews', { count: reviews?.total ?? 0 })}
        </h2>

        {/* Rating Breakdown */}
        <div
          data-testid="rating-breakdown"
          className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            {t('ratingBreakdown.title')}
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingBreakdown[star] ?? 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              const isActive = ratingFilter === star;
              return (
                <button
                  key={star}
                  data-testid={`rating-bar-${star}`}
                  onClick={() => handleRatingBarClick(star)}
                  className={`w-full flex items-center gap-3 group rounded-md px-2 py-1 transition-colors ${
                    isActive ? 'bg-accent/10' : 'hover:bg-[var(--bg-sidebar)]'
                  }`}
                >
                  <span className="text-xs font-medium text-[var(--text-secondary)] w-8 text-right">
                    {star}★
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-sidebar)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] w-8">{count}</span>
                </button>
              );
            })}
          </div>
          {ratingFilter !== undefined && (
            <button
              onClick={() => setRatingFilter(undefined)}
              className="text-xs text-accent hover:underline mt-2"
            >
              {t('ratingBreakdown.clearFilter')}
            </button>
          )}
        </div>

        {/* Write review */}
        {accessToken && enableReviews && (
          <form
            data-testid="review-form"
            onSubmit={handleSubmitReview}
            className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
          >
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {t('product.writeReview')}
            </p>
            <div className="mb-3">
              <StarRating
                value={reviewRating}
                size="lg"
                interactive
                onChange={setReviewRating}
                data-testid="review-stars"
              />
            </div>
            <textarea
              data-testid="review-comment"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder={t('product.reviewPlaceholder')}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-sidebar)] p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-accent"
            />

            {/* Photo upload for reviews */}
            <div className="mt-3" data-testid="review-images">
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                {t('photoReview.addPhotos')}
              </p>
              <div className="flex gap-2 flex-wrap">
                {reviewImages.map((url, i) => (
                  <div key={i} className="relative" data-testid={`review-image-${i}`}>
                    <img
                      src={url}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover border border-[var(--border)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveReviewImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {reviewImages.length < 3 && (
                  <FileUploadZone
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    maxSizeLabel="5MB"
                    multiple
                    onUpload={handleReviewImageUpload}
                    data-testid="review-image-upload"
                  />
                )}
              </div>
            </div>

            <Button
              data-testid="review-submit"
              type="submit"
              size="sm"
              loading={submittingReview}
              className="mt-2"
            >
              {t('product.submitReview')}
            </Button>
          </form>
        )}

        <div data-testid="reviews-list" className="space-y-4">
          {allReviews.map(review => (
            <div
              key={review.id}
              data-testid="review-item"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {review.user.avatar ? (
                    <img
                      data-testid="review-avatar"
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      data-testid="review-avatar-initial"
                      className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold"
                    >
                      {review.user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span
                    data-testid="review-user-name"
                    className="text-sm font-medium text-[var(--text-primary)]"
                  >
                    {review.user.name}
                  </span>
                </div>
                <StarRating value={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>
              )}
              {/* Review images */}
              {review.images && review.images.length > 0 && (
                <div data-testid="review-images" className="flex gap-2 mt-2">
                  {review.images.map((img, i) => (
                    <button
                      key={i}
                      data-testid={`review-image-${i}`}
                      onClick={() => {
                        setPhotoModalSrc(img);
                        setPhotoModalOpen(true);
                      }}
                      className="h-12 w-12 rounded-lg overflow-hidden border border-[var(--border)] hover:border-accent transition-colors"
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {allReviews.length === 0 && (
            <p
              data-testid="reviews-empty"
              className="text-center text-[var(--text-secondary)] py-8"
            >
              {t('product.noReviews')}
            </p>
          )}
          {/* Load More Reviews */}
          {reviews && reviews.total > 5 && allReviews.length < reviews.total && (
            <div className="flex justify-center pt-2">
              <Button
                data-testid="reviews-load-more"
                variant="secondary"
                size="sm"
                onClick={handleLoadMoreReviews}
                loading={loadingMoreReviews}
              >
                {t('common:reviews.loadMore', { ns: 'common' })}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* You May Also Like */}
      {product.category && (
        <RelatedProductsSection categoryId={product.category.id} currentProductId={product.id} />
      )}

      {/* Recently Viewed */}
      <RecentlyViewedSection currentProductId={product.id} />
    </div>
  );
}
