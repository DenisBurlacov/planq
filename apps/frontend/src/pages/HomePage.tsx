import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Sofa,
  BedDouble,
  UtensilsCrossed,
  Lamp,
  Package,
  Flower2,
  Bath,
  Monitor,
  TreePine,
  Layers,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { ProductCard } from '@components/features/ProductCard';
import { ProductCardSkeleton } from '@components/ui/Skeleton';
import { productsApi } from '@api/products';
import { cartApi } from '@api/cart';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@components/ui/Toast';
import type { Product } from '@appTypes/api';
import { ApiException } from '@api/client';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'living-room': Sofa,
  bedroom: BedDouble,
  kitchen: UtensilsCrossed,
  lighting: Lamp,
  storage: Package,
  decor: Flower2,
  bathroom: Bath,
  office: Monitor,
  outdoor: TreePine,
  textiles: Layers,
};

// Verified Unsplash hero images (Scandinavian interior)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&h=900&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&h=900&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&h=900&fit=crop&q=80',
];

export function HomePage() {
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const heroBgRef = useRef<HTMLDivElement>(null);

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

  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await cartApi.add(product.id, quantity);
      increment(quantity);
      toast('success', `${product.name} added to cart`);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed to add to cart');
    }
  };

  return (
    <div className="space-y-16">
      {/* ── Hero with parallax ────────────────────────────────────────────── */}
      <section
        data-testid="hero-section"
        className="relative rounded-2xl overflow-hidden h-[480px] md:h-[560px]"
      >
        {/* Parallax background */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 -top-16 -bottom-16 will-change-transform"
          style={{
            backgroundImage: `url(${HERO_IMAGES[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/10" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-8 md:px-14">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 mb-4 tracking-widest uppercase">
              New Collection 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-md">
              Furniture that tells
              <br />
              <span className="text-accent">your story</span>
            </h1>
            <p className="mt-4 max-w-md text-white/75 leading-relaxed">
              Scandinavian design meets everyday comfort. Discover our curated collection of premium
              home furniture and decor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                data-testid="hero-cta"
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-lg shadow-black/30"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/catalog?onSale=true"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                View Sale
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: '60+', label: 'Products' },
                { value: '10', label: 'Categories' },
                { value: '4.8★', label: 'Avg. Rating' },
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

      {/* ── Category tiles ────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section data-testid="categories-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Shop by Category</h2>
            <Link
              to="/catalog"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              All categories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map(cat => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Package;
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
                    {cat.name}
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
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Best Sellers</h2>
          <Link
            to="/catalog?sort=rating"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingBest
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers?.items.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────────── */}
      <section data-testid="new-arrivals-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">New Arrivals</h2>
          <Link
            to="/catalog"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
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
              Limited Time
            </p>
            <h3 className="text-2xl font-bold text-white">Up to 30% off sale items</h3>
            <p className="text-sm text-white/60 mt-1">Don't miss out on our seasonal discounts</p>
          </div>
          <Link
            data-testid="sale-banner-cta"
            to="/catalog?onSale=true"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors shadow-lg"
          >
            Shop Sale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
