import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@components/layout/Layout';
import { ProtectedRoute } from '@components/layout/ProtectedRoute';
import { AdminRoute } from '@components/layout/AdminRoute';
import { AdminLayout } from '@components/layout/AdminLayout';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { OfflineBanner } from '@components/OfflineBanner';
import { ToastProvider } from '@components/ui/Toast';
import { PageLoadingFallback } from '@components/ui/PageLoadingFallback';

import { useFeatureFlagsStore } from '@store/featureFlags.store';

import './i18n';

// Lazy-loaded page components (code-splitting per route)
const LoginPage = lazy(() => import('@pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@pages/RegisterPage').then(m => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage }))
);
const VerifyEmailPage = lazy(() =>
  import('@pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage }))
);
const HomePage = lazy(() => import('@pages/HomePage').then(m => ({ default: m.HomePage })));
const CatalogPage = lazy(() =>
  import('@pages/CatalogPage').then(m => ({ default: m.CatalogPage }))
);
const ProductPage = lazy(() =>
  import('@pages/ProductPage').then(m => ({ default: m.ProductPage }))
);
const CartPage = lazy(() => import('@pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import('@pages/CheckoutPage').then(m => ({ default: m.CheckoutPage }))
);
const CheckoutProcessingPage = lazy(() =>
  import('@pages/CheckoutProcessingPage').then(m => ({
    default: m.CheckoutProcessingPage,
  }))
);
const CheckoutSuccessPage = lazy(() =>
  import('@pages/CheckoutSuccessPage').then(m => ({
    default: m.CheckoutSuccessPage,
  }))
);
const CheckoutFailedPage = lazy(() =>
  import('@pages/CheckoutFailedPage').then(m => ({
    default: m.CheckoutFailedPage,
  }))
);
const OrdersPage = lazy(() => import('@pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() =>
  import('@pages/OrderDetailPage').then(m => ({ default: m.OrderDetailPage }))
);
const ProfilePage = lazy(() =>
  import('@pages/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const WalletPage = lazy(() => import('@pages/WalletPage').then(m => ({ default: m.WalletPage })));
const WishlistPage = lazy(() =>
  import('@pages/WishlistPage').then(m => ({ default: m.WishlistPage }))
);
const SupportPage = lazy(() =>
  import('@pages/SupportPage').then(m => ({ default: m.SupportPage }))
);
const AboutPage = lazy(() => import('@pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ComparePage = lazy(() =>
  import('@pages/ComparePage').then(m => ({ default: m.ComparePage }))
);
const NotFoundPage = lazy(() =>
  import('@pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
);
const ServerErrorPage = lazy(() =>
  import('@pages/ServerErrorPage').then(m => ({ default: m.ServerErrorPage }))
);
const ForbiddenPage = lazy(() =>
  import('@pages/ForbiddenPage').then(m => ({ default: m.ForbiddenPage }))
);
const RateLimitedPage = lazy(() =>
  import('@pages/RateLimitedPage').then(m => ({ default: m.RateLimitedPage }))
);
const BlogPage = lazy(() => import('@pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogArticlePage = lazy(() =>
  import('@pages/BlogArticlePage').then(m => ({ default: m.BlogArticlePage }))
);
const FaqPage = lazy(() => import('@pages/FaqPage').then(m => ({ default: m.FaqPage })));
const ContactPage = lazy(() =>
  import('@pages/ContactPage').then(m => ({ default: m.ContactPage }))
);
const PrivacyPage = lazy(() =>
  import('@pages/PrivacyPage').then(m => ({ default: m.PrivacyPage }))
);
const TermsPage = lazy(() => import('@pages/TermsPage').then(m => ({ default: m.TermsPage })));
const ShippingPage = lazy(() =>
  import('@pages/ShippingPage').then(m => ({ default: m.ShippingPage }))
);
const ReturnsPage = lazy(() =>
  import('@pages/ReturnsPage').then(m => ({ default: m.ReturnsPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@pages/admin/AdminDashboardPage').then(m => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminProductsPage = lazy(() =>
  import('@pages/admin/AdminProductsPage').then(m => ({
    default: m.AdminProductsPage,
  }))
);
const AdminOrdersPage = lazy(() =>
  import('@pages/admin/AdminOrdersPage').then(m => ({
    default: m.AdminOrdersPage,
  }))
);
const AdminUsersPage = lazy(() =>
  import('@pages/admin/AdminUsersPage').then(m => ({
    default: m.AdminUsersPage,
  }))
);
const AdminPromosPage = lazy(() =>
  import('@pages/admin/AdminPromosPage').then(m => ({
    default: m.AdminPromosPage,
  }))
);
const AdminCategoriesPage = lazy(() =>
  import('@pages/admin/AdminCategoriesPage').then(m => ({
    default: m.AdminCategoriesPage,
  }))
);
const AdminStatsPage = lazy(() =>
  import('@pages/admin/AdminStatsPage').then(m => ({
    default: m.AdminStatsPage,
  }))
);
const AdminReviewsPage = lazy(() =>
  import('@pages/admin/AdminReviewsPage').then(m => ({
    default: m.AdminReviewsPage,
  }))
);
const AdminAuditPage = lazy(() =>
  import('@pages/admin/AdminAuditPage').then(m => ({
    default: m.AdminAuditPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import('@pages/admin/AdminSettingsPage').then(m => ({
    default: m.AdminSettingsPage,
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5_000, refetchOnWindowFocus: true },
  },
});

export default function App() {
  const fetchFlags = useFeatureFlagsStore(s => s.fetchFlags);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <OfflineBanner />
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Admin */}
                <Route element={<Layout />}>
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="promos" element={<AdminPromosPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="stats" element={<AdminStatsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                  </Route>
                </Route>

                {/* Main layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/catalog/:id" element={<ProductPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogArticlePage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />

                  {/* Protected */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/processing"
                    element={
                      <ProtectedRoute>
                        <CheckoutProcessingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/success"
                    element={
                      <ProtectedRoute>
                        <CheckoutSuccessPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/failed"
                    element={
                      <ProtectedRoute>
                        <CheckoutFailedPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/wallet"
                    element={
                      <ProtectedRoute>
                        <WalletPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* System */}
                  <Route path="/403" element={<ForbiddenPage />} />
                  <Route path="/429" element={<RateLimitedPage />} />
                  <Route path="/500" element={<ServerErrorPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
