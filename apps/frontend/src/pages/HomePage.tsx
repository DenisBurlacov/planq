import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StarRating } from '@components/ui/StarRating';
import { CountdownTimer } from '@components/ui/CountdownTimer';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback, useState } from 'react';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { productsApi } from '@api/products';
import { useAuthStore } from '@store/auth.store';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@constants/categoryIcons';
import { TESTIMONIALS } from '@constants/testimonials';
import { OnboardingTour } from '@components/OnboardingTour';
import { useFeatureFlag } from '@hooks/useFeatureFlag';
import { useAddToCart } from '@hooks/useAddToCart';
import { FlakyElements } from '@components/FlakyElements';

// Verified Unsplash hero images (Scandinavian interior)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&h=900&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&h=900&fit=crop&q=80',
  // Page background — warm wood/terracotta interior
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1200&fit=crop&q=80',
];

export function HomePage() {
  const { t } = useTranslation('catalog');
  const { accessToken } = useAuthStore();
  const handleAddToCart = useAddToCart();

  const showTestimonials = useFeatureFlag('show_testimonials');
  const showCountdown = useFeatureFlag('show_countdown');
  const showTrustBadges = useFeatureFlag('show_trust_badges');
  const newCheckoutFlow = useFeatureFlag('new_checkout_flow');
  const showFlakyZone = useFeatureFlag('show_flaky_zone');

  // A/B test variant — persisted in localStorage
  const [abVariant] = useState<'A' | 'B'>(() => {
    if (!newCheckoutFlow) return 'A';
    const stored = localStorage.getItem('planq-ab-variant');
    if (stored === 'A' || stored === 'B') return stored;
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem('planq-ab-variant', variant);
    return variant;
  });

  // Update variant when flag changes
  useEffect(() => {
    if (newCheckoutFlow) {
      const stored = localStorage.getItem('planq-ab-variant');
      if (stored !== 'A' && stored !== 'B') {
        const variant = Math.random() < 0.5 ? 'A' : 'B';
        localStorage.setItem('planq-ab-variant', variant);
      }
    }
  }, [newCheckoutFlow]);

  const isVariantB = newCheckoutFlow && abVariant === 'B';

  const heroBgRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Parallax on scroll
  useEffect(() => {
    const hero = heroBgRef.current;
    if (!hero) return;
    const handleScroll = () => {
      const y = window.scrollY;
      hero.style.transform = `translateY(${y * 0.35}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'home', 'new'],
    queryFn: () => productsApi.list({ limit: 8, sort: 'newest' }),
  });

  const { data: bestSellers, isLoading: loadingBest } = useQuery({
    queryKey: ['products', 'home', 'best'],
    queryFn: () => productsApi.list({ limit: 4, sort: 'rating' }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  return (
    <div className="space-y-16">
      {/* ── Hero with parallax ────────────────────────────────────────────── */}
      {isVariantB ? (
        /* ── A/B Variant B: image left, text right ──────────────────────── */
        <section
          data-testid="hero-section"
          data-ab-variant="B"
          className="relative rounded-2xl overflow-hidden border border-[var(--border)]"
        >
          <div className="grid md:grid-cols-2 min-h-[340px] md:min-h-[420px]">
            <div className="relative">
              <div
                ref={heroBgRef}
                className="absolute inset-0 will-change-transform"
                style={{
                  backgroundImage: `url(${HERO_IMAGES[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>
            <div className="flex flex-col justify-center px-8 md:px-12 py-10 bg-[var(--bg-card)]">
              <span className="inline-block w-fit rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent mb-4 tracking-widest uppercase">
                {t('home.newCollection')}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight">
                {t('home.abVariant.heroTitle1')}
                <br />
                <span className="text-accent">{t('home.abVariant.heroTitle2')}</span>
              </h1>
              <p className="mt-4 max-w-md text-[var(--text-secondary)] leading-relaxed">
                {t('home.abVariant.heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  data-testid="hero-cta"
                  to="/catalog"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-lg"
                >
                  {t('home.abVariant.exploreCta')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-10 flex gap-8">
                {[
                  { value: '60+', label: t('home.products') },
                  { value: '10', label: t('home.categoriesCount') },
                  { value: '4.8', label: t('home.avgRating') },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ── Variant A: default overlay hero ────────────────────────────── */
        <section
          data-testid="hero-section"
          data-ab-variant="A"
          className="relative rounded-2xl overflow-hidden h-[340px] md:h-[420px]"
        >
          <div
            ref={heroBgRef}
            className="absolute inset-0 -top-16 -bottom-16 will-change-transform"
            style={{
              backgroundImage: `url(${HERO_IMAGES[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/10" />
          <div className="relative h-full flex flex-col justify-center px-8 md:px-14">
            <div className="max-w-xl">
              <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 mb-4 tracking-widest uppercase">
                {t('home.newCollection')}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-md">
                {t('home.heroTitle1')}
                <br />
                <span className="text-accent">{t('home.heroTitle2')}</span>
              </h1>
              <p className="mt-4 max-w-md text-white/75 leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  data-testid="hero-cta"
                  to="/catalog"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-lg shadow-black/30"
                >
                  {t('home.shopNow')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/catalog?onSale=true"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  {t('home.viewSale')}
                </Link>
              </div>
              <div className="mt-10 flex gap-8">
                {[
                  { value: '60+', label: t('home.products') },
                  { value: '10', label: t('home.categoriesCount') },
                  { value: '4.8★', label: t('home.avgRating') },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold text-white drop-shadow">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Badges ─────────────────────────────────────────────────── */}
      {showTrustBadges && (
        <section data-testid="trust-badges" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Truck,
              titleKey: 'home.trustBadges.shipping.title',
              subtitleKey: 'home.trustBadges.shipping.subtitle',
              testId: 'trust-badge-shipping',
            },
            {
              icon: ShieldCheck,
              titleKey: 'home.trustBadges.payment.title',
              subtitleKey: 'home.trustBadges.payment.subtitle',
              testId: 'trust-badge-payment',
            },
            {
              icon: RefreshCw,
              titleKey: 'home.trustBadges.returns.title',
              subtitleKey: 'home.trustBadges.returns.subtitle',
              testId: 'trust-badge-returns',
            },
            {
              icon: Headphones,
              titleKey: 'home.trustBadges.support.title',
              subtitleKey: 'home.trustBadges.support.subtitle',
              testId: 'trust-badge-support',
            },
          ].map(badge => (
            <div
              key={badge.testId}
              data-testid={badge.testId}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4"
            >
              <div className="rounded-lg bg-accent/10 p-2.5">
                <badge.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t(badge.titleKey)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{t(badge.subtitleKey)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Category tiles ────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section data-testid="categories-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {t('home.shopByCategory')}
            </h2>
            <Link
              to="/catalog"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              {t('home.allCategories')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map(cat => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? DEFAULT_CATEGORY_ICON;
              return (
                <Link
                  key={cat.id}
                  data-testid={`category-tile-${cat.slug}`}
                  to={`/catalog?categoryId=${cat.id}`}
                  className="group flex flex-col items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="rounded-lg bg-[var(--bg-sidebar)] p-2.5 group-hover:bg-accent/10 transition-colors">
                    <Icon className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-accent transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-tight transition-colors">
                    {t(`categories.${cat.slug}`, { defaultValue: cat.name })}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Best Sellers ──────────────────────────────────────────────────── */}
      <section data-testid="best-sellers-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('home.bestSellers')}</h2>
          <Link
            to="/catalog?sort=rating"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            {t('home.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingBest
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers?.items.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  {...(idx === 0 ? { 'data-onboarding-product': true } : {})}
                />
              ))}
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────────── */}
      <section data-testid="new-arrivals-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('home.newArrivals')}</h2>
          <Link
            to="/catalog"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            {t('home.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loadingNew
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals?.items.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
        </div>
      </section>

      {/* ── Testimonials Carousel ────────────────────────────────────────── */}
      {showTestimonials && <TestimonialsSection carouselRef={carouselRef} t={t} />}

      {/* ── Sale Banner ───────────────────────────────────────────────────── */}
      <section
        data-testid="sale-banner"
        className="relative rounded-2xl overflow-hidden border border-[var(--border)]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_IMAGES[1]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">
              {t('home.saleBannerLabel')}
            </p>
            <h3 className="text-2xl font-bold text-white">{t('home.saleBannerTitle')}</h3>
            <p className="text-sm text-white/60 mt-1">{t('home.saleBannerSubtitle')}</p>
            {showCountdown && (
              <div className="mt-3">
                <CountdownTimer
                  endDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()}
                />
              </div>
            )}
          </div>
          <Link
            data-testid="sale-banner-cta"
            to="/catalog?onSale=true"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors shadow-lg"
          >
            {t('home.shopSale')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      {/* ── Brand Partners ────────────────────────────────────────────────── */}
      <section data-testid="partners-section">
        <p
          data-testid="partners-title"
          className="text-center text-sm font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-6"
        >
          {t('home.partners.title')}
        </p>
        <div className="flex items-center justify-between gap-8 overflow-x-auto scrollbar-hide py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              data-testid={`partner-logo-${i}`}
              className="text-lg font-bold text-[var(--text-secondary)] opacity-50 hover:opacity-100 hover:text-[var(--text-primary)] transition-all duration-200 shrink-0"
            >
              {t(`home.partners.names.${i}`)}
            </span>
          ))}
        </div>
      </section>

      {/* ── QA Training Zone (Flaky Elements) ────────────────────────────── */}
      {showFlakyZone && <FlakyElements />}

      {/* Onboarding tour (shown once for logged-in users) */}
      {accessToken && <OnboardingTour />}

      {/* A/B Test dev badge */}
      {isVariantB && (
        <div
          data-testid="ab-test-badge"
          className="fixed bottom-4 left-4 z-50 rounded-lg bg-accent/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {t('home.abVariant.badge')}
        </div>
      )}
    </div>
  );
}

function TestimonialsSection({
  carouselRef,
  t,
}: {
  carouselRef: React.RefObject<HTMLDivElement>;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const scrollBy = useCallback(
    (direction: number) => {
      if (!carouselRef.current) return;
      const scrollAmount = carouselRef.current.offsetWidth * 0.8 * direction;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    },
    [carouselRef]
  );

  return (
    <section data-testid="testimonials-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            data-testid="testimonials-title"
            className="text-xl font-bold text-[var(--text-primary)]"
          >
            {t('home.testimonials.title')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">{t('home.testimonials.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="testimonials-prev"
            onClick={() => scrollBy(-1)}
            className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] shadow-sm hover:bg-[var(--bg-sidebar)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            data-testid="testimonials-next"
            onClick={() => scrollBy(1)}
            className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] shadow-sm hover:bg-[var(--bg-sidebar)] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={carouselRef}
        data-testid="testimonials-carousel"
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {TESTIMONIALS.map(testimonial => (
          <div
            key={testimonial.id}
            data-testid={`testimonial-card-${testimonial.id}`}
            className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
          >
            <div className="mb-4">
              <StarRating value={testimonial.rating} size="md" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed mb-4">
              &ldquo;{t(testimonial.quoteKey.replace('catalog:', ''))}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center">
                {testimonial.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t(testimonial.nameKey.replace('catalog:', ''))}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t(testimonial.locationKey.replace('catalog:', ''))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
