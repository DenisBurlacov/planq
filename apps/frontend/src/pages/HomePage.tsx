import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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

export function HomePage() {
  const { accessToken } = useAuthStore();
  const { increment } = useCartStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => productsApi.list({ limit: 8, sort: 'newest' }),
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
    <div>
      {/* Hero */}
      <section className="mb-12 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-[var(--border)] p-8 md:p-12">
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight">
          Furniture that tells
          <br />
          <span className="text-accent">your story</span>
        </h1>
        <p className="mt-4 max-w-md text-[var(--text-secondary)]">
          Scandinavian design meets everyday comfort. Discover our curated collection.
        </p>
        <Link
          to="/catalog"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* New arrivals */}
      <section>
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
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : data?.items.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
        </div>
      </section>
    </div>
  );
}
