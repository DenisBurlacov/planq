import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sofa, BedDouble, UtensilsCrossed, Lamp, Package, Flower2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
};

const CATEGORY_COLORS: Record<string, string> = {
  'living-room': 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  bedroom: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  kitchen: 'from-green-500/20 to-green-500/5 border-green-500/30',
  lighting: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
  storage: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
  decor: 'from-pink-500/20 to-pink-500/5 border-pink-500/30',
  bathroom: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  office: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  outdoor: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  textiles: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
};

export function HomePage() {
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleAddToCart = async (product: Product) => {
    if (!accessToken) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await cartApi.add(product.id);
      increment();
      toast('success', `${product.name} added to cart`);
    } catch (err) {
      toast('error', err instanceof ApiException ? err.message : 'Failed to add to cart');
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section
        data-testid="hero-section"
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-accent/15 via-accent/8 to-transparent border border-accent/20 p-8 md:p-14"
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent/8 blur-2xl" />

        <div className="relative max-w-xl">
          <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent mb-4 tracking-wide uppercase">
            New Collection 2026
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight">
            Furniture that tells
            <br />
            <span className="text-accent">your story</span>
          </h1>
          <p className="mt-4 max-w-md text-[var(--text-secondary)] leading-relaxed">
            Scandinavian design meets everyday comfort. Discover our curated collection of premium
            home furniture and decor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              data-testid="hero-cta"
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/catalog?onSale=true"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 px-6 py-3 text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
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
                <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category tiles */}
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
              const Icon = CATEGORY_ICONS[cat.slug];
              const colorClass =
                CATEGORY_COLORS[cat.slug] ?? 'from-gray-500/20 to-gray-500/5 border-gray-500/30';
              return (
                <Link
                  key={cat.id}
                  data-testid={`category-tile-${cat.slug}`}
                  to={`/catalog?categoryId=${cat.id}`}
                  className={`group flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br ${colorClass} p-4 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className="rounded-lg bg-white/40 dark:bg-black/20 p-2.5 group-hover:scale-110 transition-transform">
                    {Icon ? (
                      <Icon className="h-5 w-5 text-[var(--text-primary)]" />
                    ) : (
                      <Package className="h-5 w-5 text-[var(--text-primary)]" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-[var(--text-primary)] leading-tight">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Best Sellers */}
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

      {/* New Arrivals */}
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

      {/* Banner: Sale */}
      <section
        data-testid="sale-banner"
        className="rounded-2xl bg-gradient-to-r from-red-500/15 to-orange-500/10 border border-red-500/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
            Limited Time
          </p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            Up to 30% off sale items
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Don't miss out on our seasonal discounts
          </p>
        </div>
        <Link
          data-testid="sale-banner-cta"
          to="/catalog?onSale=true"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors"
        >
          Shop Sale <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
